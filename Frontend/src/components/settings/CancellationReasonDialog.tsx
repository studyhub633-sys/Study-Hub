import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CANCELLATION_REASONS,
  type CancellationReasonId,
} from "@/lib/subscription-utils";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type DialogMode = "subscription" | "account";

interface CancellationReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DialogMode;
  onConfirm: (reason: CancellationReasonId, reasonDetail?: string) => Promise<void>;
  confirmLabel?: string;
  description?: string;
}

export function CancellationReasonDialog({
  open,
  onOpenChange,
  mode,
  onConfirm,
  confirmLabel,
  description,
}: CancellationReasonDialogProps) {
  const [step, setStep] = useState<"reason" | "confirm">("reason");
  const [selectedReason, setSelectedReason] = useState<CancellationReasonId | null>(null);
  const [reasonDetail, setReasonDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("reason");
      setSelectedReason(null);
      setReasonDetail("");
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  const title =
    mode === "subscription" ? "Cancel Premium" : "Delete your account";

  const defaultDescription =
    mode === "subscription"
      ? "We're sorry to see you go. Help us understand why you're cancelling so we can improve."
      : "Before you delete your account, let us know why you're leaving.";

  const handleContinue = () => {
    if (!selectedReason) {
      setError("Please select a reason to continue.");
      return;
    }
    if (selectedReason === "other" && reasonDetail.trim().length < 3) {
      setError("Please tell us a bit more when selecting Other.");
      return;
    }
    setError(null);
    setStep("confirm");
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(selectedReason, reasonDetail.trim() || undefined);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description || defaultDescription}</DialogDescription>
        </DialogHeader>

        {step === "reason" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Why are you leaving?</Label>
              <div className="space-y-2">
                {CANCELLATION_REASONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelectedReason(option.id);
                      setError(null);
                    }}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                      selectedReason === option.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedReason === "other" && (
              <div className="space-y-2">
                <Label htmlFor="cancellation-detail">Tell us more</Label>
                <Textarea
                  id="cancellation-detail"
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  placeholder="What could we have done better?"
                  rows={4}
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Keep my account
              </Button>
              <Button onClick={handleContinue} disabled={!selectedReason}>
                Continue
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {mode === "subscription"
                ? "You can still go back if you change your mind. Confirming will process your cancellation request."
                : "This action is permanent. Your study data will be removed and you will be signed out."}
            </p>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setStep("reason")} disabled={submitting}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  confirmLabel || (mode === "subscription" ? "Confirm cancellation" : "Delete account")
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
