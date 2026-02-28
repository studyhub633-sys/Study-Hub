import { useAuth } from "@/contexts/AuthContext";
import {
    CardElement,
    Elements,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

interface StripeCheckoutProps {
    onSuccess: () => void;
    onError?: (error: string) => void;
}

const ONE_TIME_PRICE = 25.0;
const CURRENCY = "GBP";

const STRIPE_PUBLISHABLE_KEY =
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

// Initialise Stripe outside of the component to avoid recreating on every render
const stripePromise = STRIPE_PUBLISHABLE_KEY
    ? loadStripe(STRIPE_PUBLISHABLE_KEY)
    : null;

interface StripeCheckoutFormProps {
    clientSecret: string;
    onSuccess: () => void;
    onError?: (error: string) => void;
}

function StripeCheckoutForm({
    clientSecret,
    onSuccess,
    onError,
}: StripeCheckoutFormProps) {
    const { supabase } = useAuth();
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const cardTextColor = isDark ? "#ffffff" : "#09090b";
    const cardPlaceholderColor = isDark ? "#a1a1aa" : "#71717a";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (!supabase) {
            toast.error(
                "Authentication service is not configured. Please try again later.",
            );
            return;
        }

        setProcessing(true);

        try {
            const cardElement = elements.getElement(CardElement);

            if (!cardElement) {
                throw new Error("Unable to find card details input.");
            }

            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                    },
                },
            );

            if (error) {
                console.error("[Stripe] Error confirming payment:", error);
                const msg =
                    error.message ||
                    "Stripe was unable to process your payment. Please try again.";
                toast.error(msg);
                onError?.(msg);
                return;
            }

            if (
                paymentIntent &&
                (paymentIntent.status === "succeeded" ||
                    paymentIntent.status === "requires_capture")
            ) {
                // After successful Stripe payment, confirm on our backend and activate premium
                try {
                    const {
                        data: { session },
                    } = await supabase.auth.getSession();

                    if (!session?.access_token) {
                        throw new Error("Not authenticated");
                    }

                    const API_BASE_URL =
                        import.meta.env.VITE_API_URL ||
                        (import.meta.env.PROD
                            ? window.location.origin
                            : "http://localhost:3004");

                    const confirmRes = await fetch(
                        `${API_BASE_URL}/api/payments/confirm-stripe`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${session.access_token}`,
                            },
                            body: JSON.stringify({
                                paymentIntentId: paymentIntent.id,
                            }),
                        },
                    );

                    const confirmData = await confirmRes.json();

                    if (!confirmRes.ok) {
                        const msg =
                            confirmData.error ||
                            "Payment was processed but failed to activate premium. Please contact support.";
                        toast.error(msg);
                        onError?.(msg);
                        return;
                    }
                } catch (confirmError: any) {
                    console.error(
                        "[Stripe Checkout] Error confirming payment on backend:",
                        confirmError,
                    );
                    const msg =
                        confirmError.message ||
                        "Payment was processed but failed to activate premium. Please contact support.";
                    toast.error(msg);
                    onError?.(msg);
                    return;
                }

                toast.success(
                    "🎉 Payment successful! Your premium is now active.",
                    { duration: 6000 },
                );
                onSuccess();
            } else {
                const msg =
                    "Payment did not complete. Please check your card or try again.";
                toast.error(msg);
                onError?.(msg);
            }
        } catch (err: any) {
            console.error("[Stripe Checkout] Error:", err);
            const msg = err.message || "Something went wrong while paying.";
            toast.error(msg);
            onError?.(msg);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-md border bg-card px-3 py-2">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "16px",
                                color: cardTextColor,
                                "::placeholder": {
                                    color: cardPlaceholderColor,
                                },
                            },
                            invalid: {
                                color: "#e11d48",
                            },
                        },
                    }}
                />
            </div>

            <button
                type="submit"
                disabled={processing || !stripe || !elements}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
                {processing ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing payment…</span>
                    </>
                ) : (
                    <span>Pay £{ONE_TIME_PRICE.toFixed(2)} securely with card</span>
                )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
                🔒 Payments are processed securely by Stripe. Your premium
                activates once the payment succeeds.
            </p>
        </form>
    );
}

export function StripeCheckout({ onSuccess, onError }: StripeCheckoutProps) {
    const { user, supabase } = useAuth();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loadingIntent, setLoadingIntent] = useState(false);

    const API_BASE_URL =
        import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD ? window.location.origin : "http://localhost:3004");

    useEffect(() => {
        const createPaymentIntent = async () => {
            if (!supabase || !user) {
                return;
            }

            setLoadingIntent(true);

            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!session?.access_token) {
                    throw new Error("Not authenticated");
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/payments/create-payment`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({
                            provider: "stripe",
                            amount: ONE_TIME_PRICE,
                            currency: CURRENCY,
                        }),
                    },
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Failed to initialise Stripe payment. Please try again.",
                    );
                }

                if (!data.clientSecret) {
                    throw new Error(
                        "Stripe client secret was not returned from the server.",
                    );
                }

                setClientSecret(data.clientSecret);
            } catch (err: any) {
                console.error("[Stripe Checkout] Error creating payment intent:", err);
                const msg =
                    err.message ||
                    "Unable to start the payment. Please refresh and try again.";
                toast.error(msg);
                onError?.(msg);
            } finally {
                setLoadingIntent(false);
            }
        };

        createPaymentIntent();
    }, [API_BASE_URL, onError, supabase, user]);

    if (!STRIPE_PUBLISHABLE_KEY || !stripePromise) {
        return (
            <div className="text-center py-6 text-muted-foreground text-sm">
                <p>Stripe is not configured yet.</p>
                <p className="mt-1 text-xs">
                    Add{" "}
                    <code className="rounded bg-muted px-1">
                        VITE_STRIPE_PUBLISHABLE_KEY
                    </code>{" "}
                    to your environment.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                <p className="text-sm text-muted-foreground mb-1">
                    Total due today
                </p>
                <p className="text-3xl font-bold text-foreground">
                    £{ONE_TIME_PRICE.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    One-time payment — no recurring charges
                </p>
            </div>

            {loadingIntent || !clientSecret ? (
                <div className="flex items-center justify-center py-6 gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">
                        Preparing secure Stripe payment…
                    </span>
                </div>
            ) : (
                <Elements
                    stripe={stripePromise}
                    options={{
                        clientSecret,
                        appearance: { theme: "stripe" },
                    }}
                >
                    <StripeCheckoutForm
                        clientSecret={clientSecret}
                        onSuccess={onSuccess}
                        onError={onError}
                    />
                </Elements>
            )}
        </div>
    );
}
