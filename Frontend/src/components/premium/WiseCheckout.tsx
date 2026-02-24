import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Banknote, Check, Copy, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface WiseCheckoutProps {
    planType: "monthly" | "yearly";
    onSuccess: () => void;
    onError?: (error: string) => void;
}

const PLAN_PRICES: Record<string, string> = {
    monthly: "£4.99",
    yearly: "£39.99",
};

export function WiseCheckout({ planType, onSuccess, onError }: WiseCheckoutProps) {
    const { user, supabase } = useAuth();
    const [processing, setProcessing] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const referenceRef = useRef<string>(
        `REV-${user?.id?.slice(0, 6).toUpperCase() || "XXXXXX"}-${Date.now().toString(36).toUpperCase()}`
    );

    const API_BASE_URL = import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD ? window.location.origin : "http://localhost:3004");

    // Wise bank details from env vars (with fallback placeholders)
    const wiseDetails = {
        accountName: import.meta.env.VITE_WISE_ACCOUNT_NAME || "REVISELY LTD",
        sortCode: import.meta.env.VITE_WISE_SORT_CODE || "23-14-70",
        accountNumber: import.meta.env.VITE_WISE_ACCOUNT_NUMBER || "10011464",
        iban: import.meta.env.VITE_WISE_IBAN || "",
    };

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(label);
            toast.success(`${label} copied!`);
            setTimeout(() => setCopied(null), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const handleConfirmPayment = async () => {
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
                    paymentReference: referenceRef.current,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit payment confirmation");
            }

            toast.success("Payment submitted! Your premium will be activated once we verify your transfer.", {
                duration: 6000,
            });
            onSuccess();
        } catch (err: any) {
            console.error("[Wise Checkout] Error:", err);
            toast.error(err.message || "Something went wrong");
            onError?.(err.message || "Payment submission failed");
        } finally {
            setProcessing(false);
        }
    };

    const DetailRow = ({ label, value }: { label: string; value: string }) => (
        <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
            <div>
                <span className="text-xs text-muted-foreground block">{label}</span>
                <span className="text-sm font-semibold text-foreground font-mono">{value}</span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(value.replace(/[-\s]/g, ""), label)}
            >
                {copied === label ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
            </Button>
        </div>
    );

    return (
        <div className="space-y-5">
            {/* Price Summary */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <p className="text-sm text-muted-foreground mb-1">Amount to transfer</p>
                <p className="text-3xl font-bold text-foreground">{PLAN_PRICES[planType]}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{planType} plan</p>
            </div>

            {/* Bank Details */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-emerald-500" />
                    Wise Bank Transfer Details
                </h3>
                <div className="space-y-1.5">
                    <DetailRow label="Account Name" value={wiseDetails.accountName} />
                    <DetailRow label="Sort Code" value={wiseDetails.sortCode} />
                    <DetailRow label="Account Number" value={wiseDetails.accountNumber} />
                    {wiseDetails.iban && (
                        <DetailRow label="IBAN" value={wiseDetails.iban} />
                    )}
                </div>
            </div>

            {/* Payment Reference */}
            <div className="p-3 rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    ⚠️ IMPORTANT: Use this as your payment reference
                </p>
                <div className="flex items-center justify-between">
                    <code className="text-base font-bold text-foreground tracking-wider">
                        {referenceRef.current}
                    </code>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => copyToClipboard(referenceRef.current, "Reference")}
                    >
                        {copied === "Reference" ? (
                            <>
                                <Check className="h-3 w-3 text-green-500" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-3 w-3" />
                                Copy
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Instructions */}
            <div className="text-xs text-muted-foreground space-y-1.5 p-3 rounded-lg bg-muted/30">
                <p className="font-semibold text-foreground text-sm mb-2">How to pay:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Transfer <strong>{PLAN_PRICES[planType]}</strong> to the account details above</li>
                    <li>Use the reference code <strong>{referenceRef.current}</strong> as your payment reference</li>
                    <li>Click the button below to confirm you've sent the payment</li>
                    <li>Your premium access will be activated within 24 hours once verified</li>
                </ol>
            </div>

            {/* Confirm Button */}
            <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                onClick={handleConfirmPayment}
                disabled={processing}
                size="lg"
            >
                {processing ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Check className="h-4 w-4 mr-2" />
                        I've Sent My Payment
                    </>
                )}
            </Button>

            {/* Security Note */}
            <p className="text-center text-xs text-muted-foreground">
                🔒 Payments are processed securely via Wise. Your premium will be activated once we verify your transfer.
            </p>
        </div>
    );
}
