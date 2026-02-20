import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PayPalCheckoutProps {
    planType: "monthly" | "yearly";
    onSuccess: () => void;
    onError?: (error: string) => void;
}

declare global {
    interface Window {
        paypal?: any;
    }
}

export function PayPalCheckout({ planType, onSuccess, onError }: PayPalCheckoutProps) {
    const { supabase } = useAuth();
    const paypalButtonsRef = useRef<HTMLDivElement>(null);
    const cardFieldsRef = useRef<HTMLDivElement>(null);
    const cardNumberRef = useRef<HTMLDivElement>(null);
    const cardExpiryRef = useRef<HTMLDivElement>(null);
    const cardCvvRef = useRef<HTMLDivElement>(null);
    const cardNameRef = useRef<HTMLInputElement>(null);
    const [sdkReady, setSdkReady] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [cardProcessing, setCardProcessing] = useState(false);
    const [cardFieldsInstance, setCardFieldsInstance] = useState<any>(null);
    const renderedRef = useRef(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD ? window.location.origin : "http://localhost:3004");

    // Wait for PayPal SDK to load
    useEffect(() => {
        const checkSdk = () => {
            if (window.paypal) {
                setSdkReady(true);
                return;
            }
            setTimeout(checkSdk, 200);
        };
        checkSdk();
    }, []);

    // Get auth token
    const getToken = async (): Promise<string> => {
        if (!supabase) throw new Error("Not authenticated");
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("Not authenticated");
        return session.access_token;
    };

    // Create subscription via our API
    const createSubscription = async (): Promise<string> => {
        const token = await getToken();

        const response = await fetch(`${API_BASE_URL}/api/payments/create-subscription`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ planType }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({ error: "Failed to create subscription" }));
            throw new Error(data.error || "Failed to create subscription");
        }

        const data = await response.json();
        return data.subscriptionId;
    };

    // Activate subscription via our API
    const activateSubscription = async (subscriptionId: string) => {
        const token = await getToken();

        const response = await fetch(`${API_BASE_URL}/api/payments/activate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ subscriptionId }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to activate subscription");
        }
    };

    // Render PayPal buttons and card fields
    useEffect(() => {
        if (!sdkReady || renderedRef.current || !paypalButtonsRef.current) return;
        renderedRef.current = true;

        const paypal = window.paypal;

        // Render PayPal Buttons
        try {
            paypal.Buttons({
                style: {
                    shape: "rect",
                    color: "gold",
                    layout: "vertical",
                    label: "subscribe",
                },
                createSubscription: async (_data: any, actions: any) => {
                    try {
                        const subscriptionId = await createSubscription();
                        return subscriptionId;
                    } catch (err: any) {
                        toast.error(err.message);
                        throw err;
                    }
                },
                onApprove: async (data: any) => {
                    try {
                        toast.info("Processing payment...");
                        await activateSubscription(data.subscriptionID);
                        toast.success("Payment successful! Welcome to Premium! 🎉");
                        onSuccess();
                    } catch (err: any) {
                        toast.error(err.message || "Failed to activate subscription");
                        onError?.(err.message);
                    }
                },
                onError: (err: any) => {
                    console.error("[PayPal Buttons] Error:", err);
                    toast.error("Payment failed. Please try again.");
                    onError?.("Payment failed");
                },
                onCancel: () => {
                    toast.info("Payment cancelled.");
                },
            }).render(paypalButtonsRef.current);
        } catch (err) {
            console.error("[PayPal] Failed to render buttons:", err);
        }

        // Render Card Fields
        try {
            if (paypal.CardFields) {
                const cardFields = paypal.CardFields({
                    createSubscription: async () => {
                        try {
                            const subscriptionId = await createSubscription();
                            return subscriptionId;
                        } catch (err: any) {
                            toast.error(err.message);
                            throw err;
                        }
                    },
                    onApprove: async (data: any) => {
                        try {
                            toast.info("Processing card payment...");
                            await activateSubscription(data.subscriptionID);
                            toast.success("Payment successful! Welcome to Premium! 🎉");
                            onSuccess();
                        } catch (err: any) {
                            toast.error(err.message || "Failed to activate subscription");
                            onError?.(err.message);
                        }
                    },
                    onError: (err: any) => {
                        console.error("[PayPal CardFields] Error:", err);
                        setCardProcessing(false);
                        toast.error("Card payment failed. Please check your details and try again.");
                        onError?.("Card payment failed");
                    },
                    style: {
                        "input": {
                            "font-size": "14px",
                            "font-family": "'Plus Jakarta Sans', sans-serif",
                            "color": "hsl(var(--foreground))",
                            "padding": "10px 12px",
                        },
                        ".invalid": {
                            "color": "#dc2626",
                        },
                    },
                });

                setCardFieldsInstance(cardFields);

                // Card fields will be rendered when user toggles to card view
                if (cardFields.isEligible()) {
                    // Mark card fields as available
                    setShowCardForm(false); // Start hidden, toggle to show
                }
            }
        } catch (err) {
            console.error("[PayPal] Card Fields not available:", err);
        }
    }, [sdkReady]);

    // Render card fields when toggled
    useEffect(() => {
        if (!showCardForm || !cardFieldsInstance) return;

        const renderFields = async () => {
            try {
                if (cardNumberRef.current && !cardNumberRef.current.hasChildNodes()) {
                    cardFieldsInstance.NumberField().render(cardNumberRef.current);
                }
                if (cardExpiryRef.current && !cardExpiryRef.current.hasChildNodes()) {
                    cardFieldsInstance.ExpiryField().render(cardExpiryRef.current);
                }
                if (cardCvvRef.current && !cardCvvRef.current.hasChildNodes()) {
                    cardFieldsInstance.CVVField().render(cardCvvRef.current);
                }
            } catch (err) {
                console.error("[PayPal] Failed to render card fields:", err);
            }
        };

        // Small delay to ensure DOM is ready
        setTimeout(renderFields, 100);
    }, [showCardForm, cardFieldsInstance]);

    const handleCardSubmit = async () => {
        if (!cardFieldsInstance) return;

        setCardProcessing(true);
        try {
            await cardFieldsInstance.submit({
                cardholderName: cardNameRef.current?.value,
            });
        } catch (err: any) {
            console.error("[PayPal] Card submit error:", err);
            setCardProcessing(false);
            // Error is handled in onError callback
        }
    };

    if (!sdkReady) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading payment options...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* PayPal Buttons */}
            <div>
                <div ref={paypalButtonsRef} className="min-h-[100px]" />
            </div>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or pay with card</span>
                </div>
            </div>

            {/* Card Fields Toggle */}
            {!showCardForm ? (
                <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setShowCardForm(true)}
                >
                    <CreditCard className="h-4 w-4" />
                    Pay with Credit / Debit Card
                </Button>
            ) : (
                <div className="space-y-4 p-4 rounded-xl border border-border bg-card">
                    <div className="space-y-3">
                        {/* Cardholder Name */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                                Cardholder Name
                            </label>
                            <input
                                ref={cardNameRef}
                                type="text"
                                placeholder="Name on card"
                                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>

                        {/* Card Number */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                                Card Number
                            </label>
                            <div
                                ref={cardNumberRef}
                                className="rounded-md border border-input bg-background min-h-[42px]"
                            />
                        </div>

                        {/* Expiry & CVV Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">
                                    Expiry Date
                                </label>
                                <div
                                    ref={cardExpiryRef}
                                    className="rounded-md border border-input bg-background min-h-[42px]"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">
                                    CVV
                                </label>
                                <div
                                    ref={cardCvvRef}
                                    className="rounded-md border border-input bg-background min-h-[42px]"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={handleCardSubmit}
                        disabled={cardProcessing}
                    >
                        {cardProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay with Card
                            </>
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full text-xs text-muted-foreground"
                        onClick={() => setShowCardForm(false)}
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {/* Security Note */}
            <p className="text-center text-xs text-muted-foreground mt-2">
                🔒 Payments are processed securely by PayPal. We never store your card details.
            </p>
        </div>
    );
}
