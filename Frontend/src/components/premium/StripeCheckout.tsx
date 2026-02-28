import { useAuth } from "@/contexts/AuthContext";
import {
    CardElement,
    Elements,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle2, Loader2, Tag, XCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface StripeCheckoutProps {
    onSuccess: () => void;
    onError?: (error: string) => void;
}

const ONE_TIME_PRICE = 25.0;
const CURRENCY = "GBP";

// Valid discount codes: code -> discount fraction (e.g. 0.2 = 20% off)
const DISCOUNT_CODES: Record<string, number> = {
    PUBE20: 0.2,
    FRANQ20: 0.2,
    FREE100: 1.0,
};

const STRIPE_PUBLISHABLE_KEY =
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

// Initialise Stripe outside of the component to avoid recreating on every render
const stripePromise = STRIPE_PUBLISHABLE_KEY
    ? loadStripe(STRIPE_PUBLISHABLE_KEY)
    : null;

interface StripeCheckoutFormProps {
    clientSecret: string;
    finalPrice: number;
    discountCode: string;
    onSuccess: () => void;
    onError?: (error: string) => void;
}

function StripeCheckoutForm({
    clientSecret,
    finalPrice,
    discountCode,
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
                // Payment confirmed by Stripe — show success immediately so the user
                // is never left thinking their charge failed.
                toast.success(
                    "🎉 Payment successful! Your premium is now active.",
                    { duration: 6000 },
                );

                // Attempt to activate premium on our backend. If this fails we log
                // for debugging but do NOT surface an error to the user — their card
                // was charged and Stripe webhooks / manual reconciliation can fix it.
                try {
                    const {
                        data: { session },
                    } = await supabase.auth.getSession();

                    if (session?.access_token) {
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

                        if (!confirmRes.ok) {
                            const confirmData = await confirmRes.json().catch(() => ({}));
                            console.error(
                                "[Stripe Checkout] Backend activation failed (payment still succeeded):",
                                confirmData.error,
                            );
                            // Soft warning — doesn't block the success flow
                            toast.info(
                                "Your payment was received. Premium access is being activated — please refresh in a moment.",
                                { duration: 8000 },
                            );
                        }
                    }
                } catch (confirmError: any) {
                    // Log only — do not show an error to the user whose payment went through
                    console.error(
                        "[Stripe Checkout] Error confirming payment on backend (payment still succeeded):",
                        confirmError,
                    );
                    toast.info(
                        "Your payment was received. Premium access is being activated — please refresh in a moment.",
                        { duration: 8000 },
                    );
                }

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
                    <span>Pay £{finalPrice.toFixed(2)} securely with card</span>
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

    // Discount code state
    const [discountInput, setDiscountInput] = useState("");
    const [appliedCode, setAppliedCode] = useState<string | null>(null);
    const [discountError, setDiscountError] = useState<string | null>(null);
    const [codeApplying, setCodeApplying] = useState(false);

    const discountFraction = appliedCode ? (DISCOUNT_CODES[appliedCode] ?? 0) : 0;
    const finalPrice = parseFloat(
        (ONE_TIME_PRICE * (1 - discountFraction)).toFixed(2)
    );
    const savedAmount = parseFloat((ONE_TIME_PRICE - finalPrice).toFixed(2));

    // Track which price we last created a PaymentIntent for so we can recreate when discount changes
    const lastPriceRef = useRef<number | null>(null);

    const API_BASE_URL =
        import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD ? window.location.origin : "http://localhost:3004");

    const createPaymentIntent = async (price: number) => {
        if (!supabase || !user) return;

        setLoadingIntent(true);
        setClientSecret(null);

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
                        amount: price,
                        currency: CURRENCY,
                        discountCode: appliedCode ?? undefined,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to initialise payment. Please try again.",
                );
            }

            if (data.isFree) {
                // If it's a 100% free discount code
                toast.success(
                    "🎉 Premium activated successfully!",
                    { duration: 6000 },
                );
                onSuccess();
                return;
            }

            if (!data.clientSecret) {
                throw new Error(
                    "Stripe client secret was not returned from the server.",
                );
            }

            setClientSecret(data.clientSecret);
            lastPriceRef.current = price;
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

    // Create/recreate PaymentIntent whenever finalPrice changes
    useEffect(() => {
        if (lastPriceRef.current !== finalPrice) {
            createPaymentIntent(finalPrice);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finalPrice, user, supabase]);

    const handleApplyCode = () => {
        const code = discountInput.trim().toUpperCase();
        setDiscountError(null);
        setCodeApplying(true);

        setTimeout(() => {
            if (DISCOUNT_CODES[code] !== undefined) {
                setAppliedCode(code);
                setDiscountInput("");
                setDiscountError(null);
                toast.success(`Discount code "${code}" applied! You save £${(ONE_TIME_PRICE * DISCOUNT_CODES[code]).toFixed(2)}.`);
            } else {
                setDiscountError("Invalid discount code. Please check and try again.");
            }
            setCodeApplying(false);
        }, 400); // brief artificial delay for UX
    };

    const handleRemoveCode = () => {
        setAppliedCode(null);
        setDiscountError(null);
        setDiscountInput("");
    };

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
            {/* Price summary */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                <p className="text-sm text-muted-foreground mb-1">
                    Total due today
                </p>
                {appliedCode ? (
                    <>
                        <p className="text-lg line-through text-muted-foreground/60">
                            £{ONE_TIME_PRICE.toFixed(2)}
                        </p>
                        <p className="text-3xl font-bold text-green-500">
                            £{finalPrice.toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-green-500 font-medium">
                            🎉 You save £{savedAmount.toFixed(2)} with code <span className="font-bold">{appliedCode}</span>
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-3xl font-bold text-foreground">
                            £{ONE_TIME_PRICE.toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            One-time payment — no recurring charges
                        </p>
                    </>
                )}
            </div>

            {/* Discount code section */}
            <div className="space-y-2">
                {appliedCode ? (
                    <div className="flex items-center justify-between rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2">
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            <span>
                                Code <strong>{appliedCode}</strong> applied — {Math.round(discountFraction * 100)}% off
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveCode}
                            className="text-muted-foreground hover:text-foreground transition"
                            title="Remove discount code"
                        >
                            <XCircle className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                value={discountInput}
                                onChange={(e) => {
                                    setDiscountInput(e.target.value);
                                    setDiscountError(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        if (discountInput.trim()) handleApplyCode();
                                    }
                                }}
                                placeholder="Discount code"
                                className="w-full rounded-md border bg-card pl-8 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleApplyCode}
                            disabled={!discountInput.trim() || codeApplying}
                            className="rounded-md border bg-muted px-3 py-2 text-sm font-medium transition hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {codeApplying ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Apply"
                            )}
                        </button>
                    </div>
                )}
                {discountError && (
                    <p className="text-xs text-red-500">{discountError}</p>
                )}
            </div>

            {/* Card payment form */}
            {finalPrice > 0 && (
                loadingIntent || !clientSecret ? (
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
                            finalPrice={finalPrice}
                            discountCode={appliedCode ?? ""}
                            onSuccess={onSuccess}
                            onError={onError}
                        />
                    </Elements>
                )
            )}
        </div>
    );
}
