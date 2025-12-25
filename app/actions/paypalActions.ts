import axios from 'axios';
import qs from 'qs';


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
    category?: string;
    image_url?: string;
    home_url?: string;
    [key: string]: unknown;
}

export class PayPalInterface {
    _token: { expires_in: number; created: number; access_token: string } | null = null;

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
                const resp = await axios.post(url,
                    qs.stringify({ 'grant_type': 'client_credentials' }),
                    { headers, auth: Eauth }
                );
                this._token = { ...resp.data, created: new Date().getTime() };

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
            const response = await axios.post(url, orderRequest, { headers });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("PayPal create order error:", error.response?.data);
                throw new Error(`Failed to create PayPal order: ${error.response?.data?.message || error.message}`);
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
            const response = await axios.post(url, {}, { headers });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("PayPal capture order error:", error.response?.data);
                throw new Error(`Failed to capture PayPal order: ${error.response?.data?.message || error.message}`);
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
            const response = await axios.get(url, { headers });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("PayPal get order error:", error.response?.data);
                throw new Error(`Failed to get PayPal order: ${error.response?.data?.message || error.message}`);
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

            const response = await axios.post(url, data, { headers });
            console.log("PayPal product created successfully:", response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const errorData = error.response?.data;

                console.error("Error creating PayPal product:", {
                    status: status,
                    error: errorData,
                    sentData: data
                });

                let errorMessage = 'Failed to create PayPal product';

                if (status === 400) {
                    if (errorData?.details) {
                        const details = Array.isArray(errorData.details) ? errorData.details : [errorData.details];
                        const detailMessages = details.map((detail: { description?: string; message?: string }) => detail.description || detail.message || detail).join(', ');
                        errorMessage = `Bad request: ${detailMessages}`;
                    } else if (errorData?.message) {
                        errorMessage = `Bad request: ${errorData.message}`;
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
                    errorMessage = errorData?.message || error.message || 'Unknown PayPal API error';
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
                const resp = await axios.get(url, { headers });
                const data = resp.data;

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
            const resp = await axios.get(url, { headers });
            return resp.data;
        } catch (e) {
            if (axios.isAxiosError(e)) {
                console.error(`PayPal getProduct error for ID ${id}:`, {
                    status: e.response?.status,
                    statusText: e.response?.statusText,
                    data: e.response?.data
                });
                throw new Error(`Failed to get PayPal product ${id}: ${e.response?.data?.message || e.message}`);
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
            if (axios.isAxiosError(getError) && getError.response?.status === 404) {
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
            if (axios.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorMessage = error.response?.data?.message || error.message;

                console.error(`Error updating product (${statusCode}):`, error.response?.data || errorMessage);

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
            const response = await axios.patch(url, patchOperations, { headers });
            console.log('Product updated successfully:', productId);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error updating product:", {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    url: url,
                    patchOps: patchOperations
                });

                const errorMessage = error.response?.data?.message ||
                    error.response?.data?.details?.[0]?.description ||
                    error.message;

                throw new Error(`Failed to update product: ${errorMessage}`);
            } else {
                console.error("Unexpected error:", error);
                throw new Error("An unexpected error occurred while updating the product.");
            }
        }
    }
}
