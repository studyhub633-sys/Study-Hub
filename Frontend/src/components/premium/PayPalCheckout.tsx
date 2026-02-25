import { useAuth } from "@/contexts/AuthContext";
import { calculateDiscountedPrice, type DiscountCode } from "@/lib/discount";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PayPalCheckoutProps {
    planType: "monthly" | "yearly";
    onSuccess: () => void;
    onError?: (error: string) => void;
    discountCode?: DiscountCode | null;
}

const PLAN_PRICES: Record<string, number> = {
    monthly: 4.99,
    yearly: 25.00,
};

const PLAN_IDS: Record<string, string> = {
    monthly: import.meta.env.VITE_PAYPAL_PLAN_ID_MONTHLY || "",
    yearly: import.meta.env.VITE_PAYPAL_PLAN_ID_YEARLY || "",
};

export function PayPalCheckout({ planType, onSuccess, onError, discountCode }: PayPalCheckoutProps) {
    const { user, supabase } = useAuth();
    const [processing, setProcessing] = useState(false);

    const originalPrice = PLAN_PRICES[planType];
    const finalPrice = discountCode
        ? calculateDiscountedPrice(originalPrice, discountCode)
        : originalPrice;

    const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "";

    const API_BASE_URL = import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD ? window.location.origin : "http://localhost:3004");

    const handleApprove = async (subscriptionID: string) => {
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

            const response = await fetch(`${API_BASE_URL}/api/payments/create-subscription`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    planType,
                    paypalSubscriptionId: subscriptionID,
                    discountCode: discountCode?.code || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to activate subscription");
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
                {discountCode ? (
                    <div>
                        <p className="text-lg text-muted-foreground line-through">£{originalPrice.toFixed(2)}</p>
                        <p className="text-3xl font-bold text-foreground">£{finalPrice.toFixed(2)}</p>
                        <p className="text-xs text-green-500 font-medium mt-1">{discountCode.description} applied!</p>
                    </div>
                ) : (
                    <p className="text-3xl font-bold text-foreground">£{originalPrice.toFixed(2)}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1 capitalize">{planType} plan</p>
            </div>

            {/* PayPal Buttons */}
            {processing ? (
                <div className="flex items-center justify-center py-6 gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Activating your subscription...</span>
                </div>
            ) : (
                <PayPalScriptProvider
                    options={{
                        clientId: PAYPAL_CLIENT_ID,
                        vault: true,
                        intent: "subscription",
                    }}
                >
                    <PayPalButtons
                        style={{
                            shape: "rect",
                            color: "blue",
                            layout: "vertical",
                            label: "subscribe",
                        }}
                        createSubscription={(_data, actions) => {
                            return actions.subscription.create({
                                plan_id: PLAN_IDS[planType],
                            });
                        }}
                        onApprove={async (data) => {
                            if (data.subscriptionID) {
                                await handleApprove(data.subscriptionID);
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
