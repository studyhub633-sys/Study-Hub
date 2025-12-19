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
                        Beta Testing Terms & Policies
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Please review and accept our beta testing agreement to unlock lifetime premium access.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <ScrollArea className="h-[400px] my-4 p-4 border rounded-md">
                    <div className="space-y-6 text-sm text-muted-foreground">
                        <section>
                            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-secondary" />
                                1. Beta Access Agreement
                            </h3>
                            <p>
                                By participating in the Study Spark Hub Beta, you agree to help us improve the platform by providing feedback and reporting any issues you encounter. In exchange, you will receive lifetime access to all current premium features.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-secondary" />
                                2. Data & Usage
                            </h3>
                            <p>
                                During the beta phase, we may collect anonymous usage data to identify performance bottlenecks and improve user experience. Your personal study materials remain private and accessible only to you.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-secondary" />
                                3. Content Accuracy
                            </h3>
                            <p>
                                While our AI tools aim for high accuracy, please verify important information. Beta features may undergo significant changes as we refine the platform.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-secondary" />
                                4. Lifetime Benefit
                            </h3>
                            <p>
                                The "Lifetime Premium" status granted during this beta period will persist even after the official public launch. No future subscription fees will be required for features available during your beta participation.
                            </p>
                        </section>

                        <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-border">
                            <p className="font-medium text-foreground mb-1">Confirmation</p>
                            <p className="text-xs">
                                By clicking "Accept and Unlock", you confirm that you have read and understood these terms and agree to participate in the Study Spark Hub Beta Testing Program.
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
                        Accept and Unlock
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
