import { cn } from "@/lib/utils";
import { Cookie, ExternalLink, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "scientia_cookie_consent";

export function CookieBanner() {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Small delay so page loads first
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        setClosing(true);
        setTimeout(() => {
            localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
            setVisible(false);
        }, 300);
    };

    const handleDecline = () => {
        setClosing(true);
        setTimeout(() => {
            localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
            setVisible(false);
        }, 300);
    };

    if (!visible) return null;

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 transition-all duration-300",
                closing
                    ? "translate-y-full opacity-0"
                    : "translate-y-0 opacity-100 animate-slide-up"
            )}
        >
            <div className="max-w-4xl mx-auto rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">
                {/* Accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500" />

                <div className="p-5 md:p-6">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="hidden sm:flex p-3 rounded-xl bg-amber-500/10 shrink-0">
                            <Cookie className="h-6 w-6 text-amber-500" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Cookies & Terms
                                </h3>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                We use cookies to enhance your experience and analyse site
                                usage. By continuing to use Scientia.ai, you agree to our{" "}
                                <Link
                                    to="/terms"
                                    className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                                >
                                    Terms & Conditions
                                    <ExternalLink className="h-3 w-3" />
                                </Link>{" "}
                                and{" "}
                                <Link
                                    to="/privacy"
                                    className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                                >
                                    Privacy Policy
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                                .
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={handleAccept}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Accept All
                                </button>
                                <button
                                    onClick={handleDecline}
                                    className="px-6 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Essential Only
                                </button>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={handleAccept}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
                            aria-label="Close cookie banner"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
