import { useAuth } from "@/contexts/AuthContext";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PayPalCheckoutProps {
    onSuccess: () => void;
    onError?: (error: string) => void;
}

const ONE_TIME_PRICE = 25.00;

export function PayPalCheckout({ onSuccess, onError }: PayPalCheckoutProps) {
    const { user, supabase } = useAuth();
    const [processing, setProcessing] = useState(false);

    const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "";

    const API_BASE_URL = import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD ? window.location.origin : "http://localhost:3004");

    const handleApprove = async (paypalOrderId: string) => {
        if (!supabase || !user) {
            toast.error("Please sign in first.");
            return;
        }

        setProcessing(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(`${API_BASE_URL}/api/payments/create-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    paypalOrderId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to activate premium");
            }

            toast.success("🎉 Payment successful! Your premium is now active.", {
                duration: 6000,
            });
            onSuccess();
        } catch (err: any) {
            console.error("[PayPal Checkout] Error:", err);
            toast.error(err.message || "Something went wrong");
            onError?.(err.message || "Payment activation failed");
        } finally {
            setProcessing(false);
        }
    };

    if (!PAYPAL_CLIENT_ID) {
        return (
            <div className="text-center py-6 text-muted-foreground text-sm">
                <p>PayPal is not configured yet.</p>
                <p className="text-xs mt-1">Add <code className="bg-muted px-1 rounded">VITE_PAYPAL_CLIENT_ID</code> to your environment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Price Summary */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                <p className="text-sm text-muted-foreground mb-1">Total due today</p>
                <p className="text-3xl font-bold text-foreground">£{ONE_TIME_PRICE.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">One-time payment — no recurring charges</p>
            </div>

            {/* PayPal Buttons */}
            {processing ? (
                <div className="flex items-center justify-center py-6 gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Activating your premium access...</span>
                </div>
            ) : (
                <PayPalScriptProvider
                    options={{
                        clientId: PAYPAL_CLIENT_ID,
                        currency: "GBP",
                        intent: "capture",
                    }}
                >
                    <PayPalButtons
                        style={{
                            shape: "rect",
                            color: "blue",
                            layout: "vertical",
                            label: "pay",
                        }}
                        createOrder={(_data, actions) => {
                            return actions.order.create({
                                intent: "CAPTURE",
                                purchase_units: [
                                    {
                                        amount: {
                                            currency_code: "GBP",
                                            value: ONE_TIME_PRICE.toFixed(2),
                                        },
                                        description: "Revisely.ai Premium — One-Time Access",
                                    },
                                ],
                            });
                        }}
                        onApprove={async (data, actions) => {
                            // Capture the order on PayPal's side
                            if (actions.order) {
                                await actions.order.capture();
                            }
                            if (data.orderID) {
                                await handleApprove(data.orderID);
                            }
                        }}
                        onError={(err) => {
                            console.error("[PayPal] SDK error:", err);
                            const msg = "PayPal encountered an error. Please try again.";
                            toast.error(msg);
                            onError?.(msg);
                        }}
                        onCancel={() => {
                            toast.info("Payment cancelled.");
                        }}
                    />
                </PayPalScriptProvider>
            )}

            {/* Security Note */}
            <p className="text-center text-xs text-muted-foreground">
                🔒 Payments are processed securely by PayPal. Your premium activates instantly.
            </p>
        </div>
    );
}
