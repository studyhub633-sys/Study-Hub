import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Shield } from "lucide-react";

interface TermsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAccept: () => void;
}

export function TermsDialog({ open, onOpenChange, onAccept }: TermsDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-2xl">
                        <Shield className="h-6 w-6 text-primary" />
                        Subscription Terms & Policies
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Please review and accept our terms before proceeding to payment.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <ScrollArea className="h-[400px] my-4 p-4 border rounded-md">
                    <div className="space-y-6 text-sm text-muted-foreground">
                        <section>
                            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-secondary" />
                                1. Subscription Agreement
                            </h3>
                            <p>
                                By subscribing to Revisely.ai Premium, you agree to pay the applicable subscription fee (monthly or yearly) via PayPal. Your subscription will automatically renew at the end of each billing period unless cancelled.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-secondary" />
                                2. Data & Privacy
                            </h3>
                            <p>
                                We may collect anonymous usage data to improve user experience. Your personal study materials remain private and accessible only to you. For full details, please refer to our Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-secondary" />
                                3. Content Accuracy
                            </h3>
                            <p>
                                While our AI tools aim for high accuracy, please verify important information independently. Features may be updated or improved over time.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-secondary" />
                                4. Cancellation & Refunds
                            </h3>
                            <p>
                                You may cancel your subscription at any time. After cancellation, you will retain premium access until the end of your current billing period. Refund requests are handled on a case-by-case basis within 7 days of purchase.
                            </p>
                        </section>

                        <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-border">
                            <p className="font-medium text-foreground mb-1">Confirmation</p>
                            <p className="text-xs">
                                By clicking "Accept & Continue to Payment", you confirm that you have read and understood these terms and agree to the Revisely.ai Premium Subscription Terms.
                            </p>
                        </div>
                    </div>
                </ScrollArea>

                <AlertDialogFooter>
                    <AlertDialogCancel>Decline</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onAccept}
                        className="bg-premium hover:bg-premium/90 text-premium-foreground"
                    >
                        Accept & Continue to Payment
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
