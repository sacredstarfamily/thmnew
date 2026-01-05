"use server";

import { PayPalInterface, PayPalOrderRequest } from "./paypalActions";
import { prisma } from "@/lib/prisma";

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

export async function updatePayPalProduct(update: {
    id: string;
    name: string;
    price: number;
    quantity?: number;
}) {
    try {
        console.log(`🔄 Updating PayPal product: ${update.name}`);
        const paypal = new PayPalInterface();
        
        await paypal.updateProduct(update.id, {
            name: update.name,
            description: `Price: ${update.price}`
        });

        // Update or create item in database with price and inventory
        const dbItem = await prisma.product.upsert({
            where: { paypalProductId: update.id },
            update: {
                name: update.name,
                price: update.price,
                quantity: update.quantity ?? 0,
            },
            create: {
                name: update.name,
                price: update.price,
                quantity: update.quantity ?? 0,
                paypalProductId: update.id,
                imageUrl: '/images.jpeg',
            }
        });

        console.log(`✅ PayPal product updated: ${update.id}, price: ${update.price}, quantity: ${update.quantity ?? 0}, database item synced`);
        const serializedDbItem = { ...dbItem, price: dbItem.price.toNumber() };
        return { success: true, id: update.id, name: update.name, price: update.price, dbItem: serializedDbItem };
    } catch (error) {
        console.error("❌ PayPal product update failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export async function createPayPalProduct(productData: {
    name: string;
    description: string;
    imageUrl: string;
    type: string;
    category: string;
    homeUrl: string;
}) {
    try {
        const paypal = new PayPalInterface();
        const result = await paypal.createItem(
            productData.name,
            productData.description,
            0, // price is not used by PayPal catalog API
            productData.imageUrl,
            productData.type,
            productData.category,
            productData.homeUrl
        );
        return result;
    } catch (error) {
        throw error instanceof Error ? error : new Error("Failed to create PayPal product");
    }
}

export async function getProducts() {
    try {
        const products = await prisma.product.findMany();
        return { success: true, data: products.map(p => ({ ...p, price: p.price.toNumber() })) };
    } catch (error) {
        console.error("Failed to get products:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}