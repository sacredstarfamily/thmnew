"use server";

import { PayPalInterface, PayPalOrderRequest } from "./paypalActions";

export async function createPayPalOrder(orderData: PayPalOrderRequest) {
    try {
        const paypal = new PayPalInterface();
        const order = await paypal.createOrder(orderData);
        return { success: true, data: order };
    } catch (error) {
        console.error("Server: Failed to create PayPal order:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}

export async function capturePayPalOrder(orderId: string) {
    try {
        const paypal = new PayPalInterface();
        const result = await paypal.captureOrder(orderId);
        return { success: true, data: result };
    } catch (error) {
        console.error("Server: Failed to capture PayPal order:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}

export async function getPayPalOrder(orderId: string) {
    try {
        const paypal = new PayPalInterface();
        const order = await paypal.getOrder(orderId);
        return { success: true, data: order };
    } catch (error) {
        console.error("Server: Failed to get PayPal order:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}

export async function deletePayPalProduct(productId: string) {
    try {
        const paypal = new PayPalInterface();
        await paypal.deleteProduct(productId);
        return { success: true, message: "Product deleted from PayPal catalog" };
    } catch (error) {
        console.error("Server: Failed to delete PayPal product:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}

export async function updatePayPalProduct(productId: string, updates: {
    name?: string;
    description?: string;
    type?: string;
    category?: string;
    image_url?: string;
    home_url?: string;
}) {
    try {
        const paypal = new PayPalInterface();
        const result = await paypal.updateProduct(productId, updates);
        return { success: true, data: result };
    } catch (error) {
        console.error("Server: Failed to update PayPal product:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}