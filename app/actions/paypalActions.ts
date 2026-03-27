const Env = process.env.NODE_ENV;
const LIVE_URL = "https://api.paypal.com";
const SANDBOX_API = "https://api-m.sandbox.paypal.com"

// Force sandbox for development, live for production
let API_URL: string;
if (Env === 'development') {
    API_URL = SANDBOX_API;
    console.log('PayPal API: Using sandbox environment');
} else {
    API_URL = LIVE_URL;
    console.log('PayPal API: Using live environment');
}

export interface PayPalOrderRequest {
    intent: 'CAPTURE' | 'AUTHORIZE';
    purchase_units: Array<{
        reference_id?: string;
        amount: {
            currency_code: string;
            value: string;
            breakdown?: {
                item_total?: {
                    currency_code: string;
                    value: string;
                };
                shipping?: {
                    currency_code: string;
                    value: string;
                };
                tax_total?: {
                    currency_code: string;
                    value: string;
                };
            };
        };
        items?: Array<{
            name: string;
            quantity: string;
            category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS';
            unit_amount: {
                currency_code: string;
                value: string;
            };
        }>;
        description?: string;
    }>;
    application_context?: {
        brand_name?: string;
        locale?: string;
        landing_page?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE';
        shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
        user_action?: 'CONTINUE' | 'PAY_NOW';
        return_url?: string;
        cancel_url?: string;
    };
}

export interface PayPalProduct {
    id: string;
    name: string;
    description?: string;
    type?: string;
    category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS' | string;
    image_url?: string;
    home_url?: string;
    [key: string]: unknown;
}

type PayPalToken = {
    expires_in: number;
    created: number;
    access_token: string;
};

class PayPalRequestError extends Error {
    status?: number;
    data?: unknown;

    constructor(message: string, options?: { status?: number; data?: unknown }) {
        super(message);
        this.name = 'PayPalRequestError';
        this.status = options?.status;
        this.data = options?.data;
    }
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function getErrorDetailMessage(data: unknown): string | undefined {
    if (!isObject(data)) {
        return undefined;
    }

    const message = data.message;
    if (typeof message === 'string' && message.length > 0) {
        return message;
    }

    const details = data.details;
    if (Array.isArray(details) && details.length > 0) {
        const detailMessages = details
            .map((detail) => {
                if (!isObject(detail)) {
                    return undefined;
                }

                const description = detail.description;
                if (typeof description === 'string' && description.length > 0) {
                    return description;
                }

                const detailMessage = detail.message;
                return typeof detailMessage === 'string' ? detailMessage : undefined;
            })
            .filter((detail): detail is string => Boolean(detail));

        if (detailMessages.length > 0) {
            return detailMessages.join(', ');
        }
    }

    return undefined;
}

export class PayPalInterface {
    _token: PayPalToken | null = null;

    private async parseResponse(response: Response): Promise<unknown> {
        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
            return response.json();
        }

        const text = await response.text();
        return text.length > 0 ? text : null;
    }

    private async request<T>(url: string, init: RequestInit): Promise<T> {
        const response = await fetch(url, init);
        const data = await this.parseResponse(response);

        if (!response.ok) {
            throw new PayPalRequestError(
                getErrorDetailMessage(data) || `PayPal API request failed with status ${response.status}`,
                { status: response.status, data }
            );
        }

        return data as T;
    }

    async getToken() {
        if (!this._token ||
            new Date().getTime() >= this._token.created + this._token.expires_in * 1000) {
            const url = API_URL + '/v1/oauth2/token'
            const headers = {
                'Accept': 'application/json',
                'Accept-Language': 'en_US',
                'content-type': 'application/x-www-form-urlencoded',
            }

            // Use the correct credentials based on environment
            const Eauth = Env === 'development' ? {
                'username': process.env.NEXT_PUBLIC_SANDBOX_PAYPAL_ID || '',
                'password': process.env.NEXT_PUBLIC_SANDBOX_PAYPAL_SECRET || ''
            } : {
                'username': process.env.NEXT_PUBLIC_LIVE_PAYPAL_ID || '',
                'password': process.env.PAYPAL_CLIENT_SECRET || ''
            };

            console.log('PayPal Auth: Using', Env === 'development' ? 'sandbox' : 'live', 'credentials');
            console.log('PayPal Username:', Eauth.username ? `${Eauth.username.substring(0, 10)}...` : 'Missing');

            try {
                const basicAuth = Buffer.from(`${Eauth.username}:${Eauth.password}`).toString('base64');
                const resp = await this.request<Omit<PayPalToken, 'created'>>(url, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        Authorization: `Basic ${basicAuth}`,
                    },
                    body: new URLSearchParams({ grant_type: 'client_credentials' }),
                    cache: 'no-store',
                });
                this._token = { ...resp, created: new Date().getTime() };

                if (this._token) {
                    this._token.created = new Date().getTime();
                }
            } catch (e) {
                throw new Error(`Failed to get PayPal token: ${e}`);
            }
        }
        return this._token;
    }

    async createOrder(orderRequest: PayPalOrderRequest) {
        const token = await this.getToken();
        const url = API_URL + '/v2/checkout/orders';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`,
            'PayPal-Request-Id': `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        try {
            return await this.request(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(orderRequest),
                cache: 'no-store',
            });
        } catch (error) {
            if (error instanceof PayPalRequestError) {
                console.error("PayPal create order error:", error.data);
                throw new Error(`Failed to create PayPal order: ${getErrorDetailMessage(error.data) || error.message}`);
            }
            throw error;
        }
    }

    async captureOrder(orderId: string) {
        const token = await this.getToken();
        const url = API_URL + `/v2/checkout/orders/${orderId}/capture`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`,
        };

        try {
            return await this.request(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({}),
                cache: 'no-store',
            });
        } catch (error) {
            if (error instanceof PayPalRequestError) {
                console.error("PayPal capture order error:", error.data);
                throw new Error(`Failed to capture PayPal order: ${getErrorDetailMessage(error.data) || error.message}`);
            }
            throw error;
        }
    }

    async getOrder(orderId: string) {
        const token = await this.getToken();
        const url = API_URL + `/v2/checkout/orders/${orderId}`;
        const headers = {
            'Authorization': `Bearer ${token?.access_token}`,
        };

        try {
            return await this.request(url, {
                method: 'GET',
                headers,
                cache: 'no-store',
            });
        } catch (error) {
            if (error instanceof PayPalRequestError) {
                console.error("PayPal get order error:", error.data);
                throw new Error(`Failed to get PayPal order: ${getErrorDetailMessage(error.data) || error.message}`);
            }
            throw error;
        }
    }

    async createItem(
        itemName: string,
        itemDescription: string,
        itemPrice: number,
        imageUrl: string,
        itemType: string = "SERVICE",
        itemCategory: string = "SOFTWARE",
        homeUrl: string = "https://themiracle.love"
    ) {
        const token = await this.getToken();
        const url = API_URL + '/v1/catalogs/products';
        const headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'content-type': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`
        };

        // Enhanced input validation and cleaning
        if (!itemName || itemName.trim().length === 0) {
            throw new Error('Product name is required');
        }

        const cleanName = itemName.trim();
        if (cleanName.length > 127) {
            throw new Error('Product name must be 127 characters or less');
        }

        // Remove any problematic characters from name
        const sanitizedName = cleanName.replace(/[^\w\s\-\.,'!?()&]/g, '');
        if (sanitizedName.length === 0) {
            throw new Error('Product name contains only invalid characters');
        }

        if (!itemDescription || itemDescription.trim().length === 0) {
            throw new Error('Product description is required');
        }

        const cleanDescription = itemDescription.trim();
        if (cleanDescription.length > 256) {
            throw new Error('Product description must be 256 characters or less');
        }

        // Remove any problematic characters from description
        const sanitizedDescription = cleanDescription.replace(/[^\w\s\-\.,'!?()&$%]/g, '');
        if (sanitizedDescription.length === 0) {
            throw new Error('Product description contains only invalid characters');
        }

        // Validate URLs
        if (!imageUrl || !imageUrl.startsWith('https://')) {
            throw new Error('Image URL is required and must use HTTPS protocol');
        }

        if (!homeUrl || !homeUrl.startsWith('https://')) {
            throw new Error('Home URL is required and must use HTTPS protocol');
        }

        // Test URL validity
        try {
            new URL(imageUrl);
            new URL(homeUrl);
        } catch (urlError) {
            throw new Error('Invalid URL format provided' + (urlError instanceof Error ? `: ${urlError.message}` : ''));
        }

        // Validate product type
        const validTypes = ['PHYSICAL', 'DIGITAL', 'SERVICE'];
        if (!validTypes.includes(itemType)) {
            throw new Error(`Invalid product type: ${itemType}. Must be one of: ${validTypes.join(', ')}`);
        }

        // Validate category
        const validCategories = [
            'SOFTWARE',
            'DIGITAL_MEDIA_BOOKS_MOVIES_MUSIC', // Changed from DIGITAL_GOODS
            'BOOKS_PERIODICALS_AND_NEWSPAPERS',
            'ENTERTAINMENT',
            'MUSIC',
            'GAMES',
            'EDUCATION_AND_TEXTBOOKS',
            'ART_AND_CRAFTS',
            'COLLECTIBLES',
            'CLOTHING_SHOES_AND_ACCESSORIES',
            'ELECTRONICS_AND_COMPUTERS',
            'TOYS_AND_HOBBIES',
            'OTHER'
        ];
        if (!validCategories.includes(itemCategory)) {
            throw new Error(`Invalid category: ${itemCategory}. Must be one of: ${validCategories.join(', ')}`);
        }

        // Ensure URLs are properly formatted
        const cleanImageUrl = imageUrl.trim();
        const cleanHomeUrl = homeUrl.trim();

        const data = {
            "name": sanitizedName,
            "description": sanitizedDescription,
            "type": itemType,
            "category": itemCategory,
            "image_url": cleanImageUrl,
            "home_url": cleanHomeUrl
        };

        try {
            console.log("Creating PayPal product with sanitized data:", {
                name: data.name,
                description: data.description.substring(0, 50) + (data.description.length > 50 ? '...' : ''),
                type: data.type,
                category: data.category,
                image_url: data.image_url,
                home_url: data.home_url
            });

            const response = await this.request(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
                cache: 'no-store',
            });
            console.log("PayPal product created successfully:", response);
            return response;
        } catch (error) {
            if (error instanceof PayPalRequestError) {
                const status = error.status;
                const errorData = error.data;
                const errorPayload = isObject(errorData) ? errorData : undefined;

                console.error("Error creating PayPal product:", {
                    status: status,
                    error: errorData,
                    sentData: data
                });

                let errorMessage = 'Failed to create PayPal product';

                if (status === 400) {
                    const detailsValue = errorPayload?.details;
                    if (detailsValue) {
                        const details = Array.isArray(detailsValue) ? detailsValue : [detailsValue];
                        const detailMessages = details.map((detail: { description?: string; message?: string }) => detail.description || detail.message || detail).join(', ');
                        errorMessage = `Bad request: ${detailMessages}`;
                    } else if (typeof errorPayload?.message === 'string' && errorPayload.message.length > 0) {
                        errorMessage = `Bad request: ${errorPayload.message}`;
                    } else {
                        errorMessage = 'Bad request: The data sent to PayPal is invalid';
                    }
                } else if (status === 401) {
                    errorMessage = 'Authentication failed: Invalid PayPal credentials';
                } else if (status === 403) {
                    errorMessage = 'Access forbidden: Insufficient permissions';
                } else if (status === 422) {
                    errorMessage = 'Unprocessable entity: PayPal cannot process this product data';
                } else {
                    errorMessage = getErrorDetailMessage(errorData) || error.message || 'Unknown PayPal API error';
                }

                throw new Error(errorMessage);
            } else {
                console.error("Unexpected error:", error);
                throw new Error("An unexpected error occurred while creating the PayPal product.");
            }
        }
    }
    async getItems() {
        const token = await this.getToken();
        const allProducts: PayPalProduct[] = [];
        let page = 1;
        let hasMore = true;
        const pageSize = 20; // PayPal's maximum page size

        try {
            while (hasMore) {
                const url = API_URL + `/v1/catalogs/products?page_size=${pageSize}&page=${page}&total_required=true`;
                const headers = {
                    'Accept': 'application/json',
                    'Accept-Language': 'en_US',
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${token?.access_token}`
                };

                console.log(`Fetching PayPal products page ${page}...`);
                const data = await this.request<{ products?: PayPalProduct[]; total_items?: number }>(url, {
                    method: 'GET',
                    headers,
                    cache: 'no-store',
                });

                if (data.products && data.products.length > 0) {
                    allProducts.push(...data.products);
                    console.log(`Fetched ${data.products.length} products from page ${page}, total so far: ${allProducts.length}`);
                } else {
                    console.log(`No products found on page ${page}, stopping pagination`);
                    hasMore = false;
                    break;
                }

                // Check if we've reached the end
                if (data.products.length < pageSize) {
                    console.log(`Received fewer than ${pageSize} products, reached end of catalog`);
                    hasMore = false;
                } else if (data.total_items && allProducts.length >= data.total_items) {
                    console.log(`Fetched all ${data.total_items} available products`);
                    hasMore = false;
                } else {
                    page++;
                    // Add a small delay to be respectful to PayPal's API
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                // Safety check to prevent infinite loops
                if (page > 100) {
                    console.warn('Reached maximum page limit (100), stopping pagination');
                    hasMore = false;
                }
            }

            console.log(`✅ PayPal catalog fetch complete: ${allProducts.length} total products retrieved`);

            return {
                products: allProducts,
                total_items: allProducts.length
            };

        } catch (e) {
            console.error('Error fetching PayPal products:', e);
            throw new Error(`Failed to get PayPal items: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    }

    async getProduct(id: string) {
        const token = await this.getToken();
        const url = API_URL + '/v1/catalogs/products/' + id;
        const headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'content-type': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`
        }
        try {
            return await this.request<PayPalProduct>(url, {
                method: 'GET',
                headers,
                cache: 'no-store',
            });
        } catch (e) {
            if (e instanceof PayPalRequestError) {
                console.error(`PayPal getProduct error for ID ${id}:`, {
                    status: e.status,
                    data: e.data
                });
                throw e;
            }
            console.error("Unexpected error in getProduct:", e);
            throw new Error(`Unexpected error getting PayPal product ${id}: ${e}`);
        }
    }

    async deleteProduct(productId: string) {

        // First check if the product exists and get its current data
        let currentProduct: PayPalProduct | undefined;
        try {
            currentProduct = await this.getProduct(productId);
            console.log(`Product ${productId} exists, proceeding with name update.`);
        } catch (getError) {
            if (getError instanceof PayPalRequestError && getError.status === 404) {
                console.log(`Product ${productId} not found - cannot update name`);
                throw new Error(`PayPal product not found (404): Product ${productId} does not exist in PayPal catalog`);
            }
            // If it's another error, throw it
            console.error(`Could not verify product existence: ${getError}`);
            throw new Error(`Failed to verify product existence: ${getError}`);
        }

        try {
            // Update the product name to indicate no inventory instead of deleting
            if (!currentProduct) {
                throw new Error(`Product ${productId} could not be loaded for update.`);
            }
            const originalName = currentProduct.name || 'Unnamed Product';
            const updatedName = originalName.includes('| no inventory')
                ? originalName
                : `${originalName} | no inventory`;

            const updateResult = await this.updateProduct(productId, {
                name: updatedName
            });

            console.log('Product marked as no inventory:', productId);
            return updateResult;
        } catch (error) {
            if (error instanceof PayPalRequestError) {
                const statusCode = error.status;
                const errorMessage = getErrorDetailMessage(error.data) || error.message;

                console.error(`Error updating product (${statusCode}):`, error.data || errorMessage);

                // Provide more specific error messages based on status code
                if (statusCode === 404) {
                    throw new Error(`PayPal product not found (404): Product ${productId} does not exist in PayPal catalog`);
                } else if (statusCode === 403) {
                    throw new Error(`PayPal access forbidden (403): No permission to update product ${productId}`);
                } else if (statusCode === 401) {
                    throw new Error(`PayPal authentication failed (401): Invalid or expired token`);
                } else {
                    throw new Error(`Failed to update product (${statusCode}): ${errorMessage}`);
                }
            } else {
                console.error("Unexpected error:", error);
                throw new Error("An unexpected error occurred while updating the product.");
            }
        }
    }

    async updateProduct(productId: string, updates: {
        name?: string;
        description?: string;
        type?: string;
        category?: string;
        image_url?: string;
        home_url?: string;
    }) {
        const token = await this.getToken();
        const url = API_URL + `/v1/catalogs/products/${productId}`;
        const headers = {
            'Content-Type': 'application/json-patch+json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`,
        };

        // Create patch operations array with proper PayPal schema
        const patchOperations: Array<{
            op: 'replace';
            path: string;
            value: string;
        }> = [];

        if (updates.name !== undefined) {
            patchOperations.push({
                op: 'replace',
                path: '/name',
                value: updates.name
            });
        }

        if (updates.description !== undefined) {
            patchOperations.push({
                op: 'replace',
                path: '/description',
                value: updates.description
            });
        }

        if (updates.category !== undefined) {
            patchOperations.push({
                op: 'replace',
                path: '/category',
                value: updates.category
            });
        }

        if (updates.image_url !== undefined) {
            patchOperations.push({
                op: 'replace',
                path: '/image_url',
                value: updates.image_url
            });
        }

        if (updates.home_url !== undefined) {
            patchOperations.push({
                op: 'replace',
                path: '/home_url',
                value: updates.home_url
            });
        }

        // PayPal doesn't allow updating 'type' after creation, so we'll skip it
        // if (updates.type !== undefined) {
        //     patchOperations.push({
        //         op: 'replace',
        //         path: '/type',
        //         value: updates.type
        //     });
        // }

        if (patchOperations.length === 0) {
            throw new Error('No valid updates provided');
        }

        console.log('PayPal patch operations:', JSON.stringify(patchOperations, null, 2));

        try {
            const response = await this.request(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(patchOperations),
                cache: 'no-store',
            });
            console.log('Product updated successfully:', productId);
            return response;
        } catch (error) {
            if (error instanceof PayPalRequestError) {
                console.error("Error updating product:", {
                    status: error.status,
                    data: error.data,
                    url: url,
                    patchOps: patchOperations
                });

                const errorMessage = getErrorDetailMessage(error.data) ||
                    error.message;

                throw new Error(`Failed to update product: ${errorMessage}`);
            } else {
                console.error("Unexpected error:", error);
                throw new Error("An unexpected error occurred while updating the product.");
            }
        }
    }
}

// Removed "use server" and updatePayPalProduct function.
// Import updatePayPalProduct from ./paypalServerActions instead.
