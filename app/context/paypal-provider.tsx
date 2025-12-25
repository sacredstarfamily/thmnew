"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode, useState } from "react";

interface PayPalProviderProps {
    children: ReactNode;
}

const isDevelopment = process.env.NODE_ENV === 'development';

// Enhanced client ID validation and fallback
const getClientId = () => {
    const clientId = isDevelopment
        ? process.env.NEXT_PUBLIC_SANDBOX_PAYPAL_ID
        : process.env.NEXT_PUBLIC_LIVE_PAYPAL_ID;

    console.log('PayPal Environment:', isDevelopment ? 'Development (Sandbox)' : 'Production (Live)');
    console.log('PayPal Client ID:', clientId ? `${clientId.substring(0, 10)}...` : 'Not found');

    if (!clientId) {
        console.error('PayPal Client ID not found. Please check your environment variables:');
        console.error('Development:', process.env.NEXT_PUBLIC_SANDBOX_PAYPAL_ID ? 'Set' : 'Missing');
        console.error('Production:', process.env.NEXT_PUBLIC_LIVE_PAYPAL_ID ? 'Set' : 'Missing');
        return null;
    }

    // Validate the client ID format (should be around 80+ characters for real PayPal IDs)
    if (clientId.length < 50) {
        console.error('PayPal client ID appears to be invalid (too short)');
        return null;
    }

    return clientId;
};

const clientId = getClientId();

const initialOptions = {
    clientId: clientId || "test", // Fallback to test
    currency: "USD",
    intent: "capture" as const,
    components: "buttons,messages",
    enableFunding: "venmo,paylater",
    disableFunding: "",
    dataClientToken: undefined,
    vault: false,
    commit: true,
    locale: "en_US",
    debug: false, // Disable debug to reduce zoid conflicts
    // Enhanced options to prevent zoid destruction
    dataNamespace: "paypal_sdk",
    dataClientMetadataId: undefined,
    // Additional stability options
    "disable-funding": "",
    "enable-funding": "venmo,paylater",
};

export default function PayPalProvider({ children }: PayPalProviderProps) {
    const [shouldLoadPayPal] = useState(() => !!clientId);
    const [paypalError] = useState<string | null>(() => 
        !clientId ? 'PayPal client ID is missing or invalid' : null
    );

    if (clientId) {
        console.log('PayPal Provider: Using client ID for', isDevelopment ? 'sandbox' : 'live', 'environment');
    }

    // Show children without PayPal if there's an error or missing config
    if (!shouldLoadPayPal) {
        if (paypalError) {
            console.warn(`PayPal Provider: ${paypalError}. PayPal features will be disabled.`);
        }
        return <>{children}</>;
    }

    return (
        <PayPalScriptProvider
            options={initialOptions}
            deferLoading={false}
        >
            {children}
        </PayPalScriptProvider>
    );
}
