import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LimitReachedDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LimitReachedDialog({ open, onOpenChange }: LimitReachedDialogProps) {
    const navigate = useNavigate();

    if (!open) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            open ? "flex items-center justify-center p-4" : "hidden"
        )}>
            <div className="relative w-full max-w-lg p-6 bg-card border rounded-xl shadow-lg animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-amber-500/10 rounded-full">
                        <Sparkles className="h-8 w-8 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Usage Limit Reached</h2>
                    <p className="text-muted-foreground">
                        You've reached your free limit of 10 AI interactions.
                        To continue utilizing our AI tools and unlock unlimited access, please upgrade to Premium.
                    </p>

                    <div className="w-full pt-4 space-y-2">
                        <Button
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                            size="lg"
                            onClick={() => navigate("/premium-dashboard")}
                        >
                            Upgrade to Premium
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => navigate("/dashboard")}
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
