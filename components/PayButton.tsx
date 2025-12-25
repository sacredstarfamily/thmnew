'use client';
import { Spinner } from "@/components/icons";
import type { PayPalButtonsComponentProps } from "@paypal/react-paypal-js";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useCallback, useEffect, useRef, useState } from "react";

export default function PayButton() {
    const [{ isResolved, isPending, isRejected }] = usePayPalScriptReducer();
    const [isProcessing, setIsProcessing] = useState(false);
    const [buttonsKey, setButtonsKey] = useState(0);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null); // Start with null

    // Add ref to prevent rapid button remounting
    const buttonsMountedRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const donationAmounts = [20, 50, 100, 250];

    const handleError = useCallback(() => {
        setIsProcessing(false);
        // Delay button regeneration to prevent zoid conflicts
        setTimeout(() => {
            setButtonsKey(prev => prev + 1);
            buttonsMountedRef.current = false;
        }, 1000);
    }, []);

    const handleAmountChange = useCallback((amount: number) => {
        if (isProcessing) return;

        setSelectedAmount(amount);
        buttonsMountedRef.current = false;
        // Delay button regeneration
        setTimeout(() => {
            setButtonsKey(prev => prev + 1);
        }, 100);
    }, [isProcessing]);

    // Track button mounting state
    useEffect(() => {
        if (isResolved && !buttonsMountedRef.current && selectedAmount !== null) {
            buttonsMountedRef.current = true;
        }
    }, [isResolved, buttonsKey, selectedAmount]);

    // Show error state if PayPal SDK failed to load
    if (isRejected) {
        return (
            <div className="flex flex-col align-middle justify-center">
                <div className="w-full max-w-md mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-4">Support themiracle</h1>
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                        <p className="text-sm font-medium">PayPal Donations Unavailable</p>
                        <p className="text-sm mt-1">
                            PayPal services are currently unavailable. This may be due to:
                        </p>
                        <ul className="text-xs mt-2 text-left list-disc list-inside">
                            <li>Temporary PayPal service outage</li>
                            <li>Invalid PayPal configuration</li>
                            <li>Network connectivity issues</li>
                        </ul>
                        <p className="text-sm mt-2">
                            Please try again later or contact support.
                        </p>
                    </div>

                    {/* Alternative donation methods could go here */}
                    <div className="mt-4 text-xs text-gray-500">
                        <p>Alternative ways to support:</p>
                        <p className="mt-1">Visit our community at themiracle.love</p>
                    </div>
                </div>
            </div>
        );
    }

    const buttonStyles: PayPalButtonsComponentProps = {
        style: {
            color: "gold",
            shape: "pill",
            label: "donate",
            disableMaxWidth: true,
            height: 35,
        },
        createOrder: (data, actions) => {
            if (isProcessing || selectedAmount === null) {
                throw new Error("Order creation already in progress or no amount selected");
            }

            setIsProcessing(true);
            console.log(`Creating donation order for $${selectedAmount}`);

            return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: selectedAmount.toString(),
                        },
                        description: `Donation of $${selectedAmount} to themiracle.love`,
                    },
                ],
                application_context: {
                    brand_name: "themiracle.love",
                    user_action: "PAY_NOW",
                },
            });
        },
        onApprove: async (data, actions) => {
            try {
                const details = await actions.order?.capture();
                alert(
                    `🎉 Thank you for your donation!\n\nDonation amount: $${selectedAmount}\nTransaction completed by: ${details?.payment_source?.paypal?.name?.given_name ?? "Generous donor"
                    }\n\nYour support helps keep themiracle.love running!`
                );
            } catch (error) {
                console.error("Donation capture error:", error);
                alert("There was an error processing your donation. Please try again.");
            } finally {
                setIsProcessing(false);
            }
        },
        onError: (error) => {
            console.error("PayPal donation error:", error);
            handleError();
            alert("PayPal encountered an error. Please try again or contact support if the problem persists.");
        },
        onCancel: () => {
            console.log("Donation cancelled");
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col align-middle justify-center" style={{ zIndex: 10, position: "relative" }}>
            <div className="w-full max-w-md mx-auto text-center">
                <h1 className="text-2xl font-bold mb-4">Donate to themiracle</h1>

                {/* Donation Amount Selection */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">Choose your donation amount:</p>
                    <div className="grid grid-cols-2 gap-2">
                        {donationAmounts.map((amount) => (
                            <button
                                key={amount}
                                onClick={() => handleAmountChange(amount)}
                                disabled={isProcessing}
                                className={`py-2 px-4 rounded-lg border-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${selectedAmount === amount
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-md transform scale-105'
                                    : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-50 hover:shadow-sm'
                                    }`}
                            >
                                <span className="font-sans">$</span>{amount}
                            </button>
                        ))}
                    </div>
                    {selectedAmount !== null && (
                        <p className="text-xs text-gray-500 mt-2">
                            Selected: <span className="font-semibold text-blue-600"><span className="font-sans">$</span>{selectedAmount}</span>
                        </p>
                    )}
                    {selectedAmount === null && (
                        <p className="text-xs text-gray-400 mt-2">
                            Please select an amount to continue
                        </p>
                    )}
                </div>

                {/* PayPal Buttons - Only show after amount is selected */}
                {selectedAmount !== null && (
                    <>
                        {isResolved && !isPending ? (
                            <div
                                ref={containerRef}
                                className="w-full"
                            >
                                {buttonsMountedRef.current ? (
                                    <div key={`donation-buttons-${buttonsKey}-${selectedAmount}`}>
                                        <PayPalButtons
                                            {...buttonStyles}
                                            forceReRender={[buttonsKey, selectedAmount]}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-6 bg-gray-50 rounded">
                                        <Spinner size="lg" />
                                        <span className="ml-4 text-sm">Loading PayPal buttons...</span>
                                    </div>
                                )}
                                {isProcessing && (
                                    <div className="mt-3 flex items-center justify-center text-blue-600">
                                        <Spinner size="md" />
                                        <span className="ml-4 text-sm">Processing your ${selectedAmount} donation...</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-6">
                                <Spinner size="lg" />
                                <span className="ml-4 text-sm">
                                    {isPending ? 'Loading PayPal donation button...' : 'Initializing PayPal...'}
                                </span>
                            </div>
                        )}
                    </>
                )}

                {/* Additional Info */}
                <div className="mt-4 text-xs text-gray-500">
                    <p>🔒 Secure donation powered by PayPal</p>
                    <p className="mt-1">Your donation helps support themiracle.love community</p>
                    {process.env.NODE_ENV === 'development' && (
                        <p className="mt-1 text-orange-500">
                            Development Mode: Using PayPal Sandbox
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}