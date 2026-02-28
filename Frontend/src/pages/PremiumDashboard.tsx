import { AppLayout } from "@/components/layout/AppLayout";
import { StripeCheckout } from "@/components/premium/StripeCheckout";
import { TermsDialog } from "@/components/premium/TermsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
    cancelSubscription as cancelPaymentSubscription,
    getSubscription as getPaymentSubscription,
} from "@/lib/payment-client";
import { hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    Bot,
    Brain,
    Calculator,
    Calendar,
    Check,
    CheckCircle,
    Crown,
    FileText,
    GraduationCap,
    Layers,
    Loader2,
    Lock,
    Network,
    Rocket,
    Shield,
    Sparkles,
    Timer,
    Trophy,
    Users,
    Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";



export default function PremiumDashboard() {
    const { user, supabase } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [isPremium, setIsPremium] = useState(false);
    const [checking, setChecking] = useState(true);
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [hasPredictedPapers, setHasPredictedPapers] = useState(false);
    const [hasWorkExperience, setHasWorkExperience] = useState(false);
    const [checkingContent, setCheckingContent] = useState(true);

    // Dashboard-specific feature list (Tools)
    const dashboardFeatures = [
        {
            title: t('premium.features.aiTutor.title'),
            description: t('premium.features.aiTutor.description'),
            icon: Bot,
            path: "/ai-tutor",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            hoverBg: "bg-amber-500",
        },
        {
            title: t('premium.features.noteCondenser.title'),
            description: t('premium.features.noteCondenser.description'),
            icon: FileText,
            path: "/premium/note-condenser",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            hoverBg: "bg-blue-500",
        },
        {
            title: t('premium.features.predictedGrades.title'),
            description: t('premium.features.predictedGrades.description'),
            icon: Calculator,
            path: "/premium/predicted-grades",
            color: "text-green-500",
            bg: "bg-green-500/10",
            hoverBg: "bg-green-500",
        },
        {
            title: t('premium.features.focusMode.title'),
            description: t('premium.features.focusMode.description'),
            icon: Timer,
            path: "/premium/focus-mode",
            color: "text-red-500",
            bg: "bg-red-500/10",
            hoverBg: "bg-red-500",
        },
        {
            title: t('premium.features.leaderboards.title'),
            description: t('premium.features.leaderboards.description'),
            icon: Trophy,
            path: "/premium/leaderboard",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            hoverBg: "bg-orange-500",
        },
        {
            title: t('premium.features.virtualSessions.title'),
            description: t('premium.features.virtualSessions.description'),
            icon: Users,
            path: "/premium/virtual-sessions",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            hoverBg: "bg-indigo-500",
        },
        {
            title: t('premium.features.homeworkTracker.title'),
            description: t('premium.features.homeworkTracker.description'),
            icon: Calendar,
            path: "/premium/homework-tracker",
            color: "text-pink-500",
            bg: "bg-pink-500/10",
            hoverBg: "bg-pink-500",
        },
        {
            title: t('premium.features.studyPlans.title'),
            description: t('premium.features.studyPlans.description'),
            icon: Sparkles,
            path: "/premium/study-plans",
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
            hoverBg: "bg-cyan-500",
        },
        {
            title: t('premium.features.mindMap.title'),
            description: t('premium.features.mindMap.description'),
            icon: Network,
            path: "/premium/mind-map-generator",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            hoverBg: "bg-purple-500",
        },
        {
            title: t('premium.features.aiExaminer.title'),
            description: t('premium.features.aiExaminer.description'),
            icon: GraduationCap,
            path: "/premium/ai-examiner",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            hoverBg: "bg-blue-500",
        },
        {
            title: t('premium.features.performanceHeatmap.title'),
            description: t('premium.features.performanceHeatmap.description'),
            icon: BarChart3,
            path: "/premium/performance-heatmap",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            hoverBg: "bg-orange-500",
        },
        {
            title: t('premium.features.grade9Notes.title'),
            description: t('premium.features.grade9Notes.description'),
            icon: FileText,
            path: "/premium/grade-9-notes",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            hoverBg: "bg-emerald-500",
        },
        {
            title: "Grade 9 Flashcards",
            description: "Premium flashcards for rapid revision and retention",
            icon: Layers,
            path: "/premium/grade-9-flashcards",
            color: "text-pink-500",
            bg: "bg-pink-500/10",
            hoverBg: "bg-pink-500",
        },

    ];

    // Feature Benefits list - all uniform, non-clickable display cards
    const benefitFeatures = [
        {
            icon: Brain,
            title: t('premium.features.aiQuestions.title'),
            description: t('premium.dashboard.unlimitedAIDescription'),
        },
        {
            icon: Bot,
            title: t('premium.features.aiTutor.title'),
            description: t('premium.features.aiTutor.description'),
        },
        {
            icon: Timer,
            title: t('premium.features.performanceHeatmap.title'),
            description: t('premium.features.performanceHeatmap.description'),
        },
        {
            icon: Shield,
            title: t('premium.features.focusMode.title'),
            description: t('premium.features.focusMode.description'),
        },
        {
            icon: Users,
            title: t('premium.features.virtualSessions.title'),
            description: t('premium.features.virtualSessions.description'),
        },
        {
            icon: Brain,
            title: t('premium.features.grade9Notes.title'),
            description: t('premium.features.grade9Notes.description'),
        },
        {
            icon: Timer,
            title: t('premium.features.homeworkTracker.title'),
            description: t('premium.features.homeworkTracker.description'),
        },
        {
            icon: Sparkles,
            title: t('premium.features.studyPlans.title'),
            description: t('premium.features.studyPlans.description'),
        },
        {
            icon: Brain,
            title: t('premium.features.mindMap.title'),
            description: t('premium.features.mindMap.description'),
        },
        {
            icon: GraduationCap,
            title: t('premium.features.aiExaminer.title'),
            description: t('premium.features.aiExaminer.description'),
        },
        {
            icon: BarChart3,
            title: t('premium.features.performanceHeatmap.title'),
            description: t('premium.features.performanceHeatmap.description'),
        },
        {
            icon: Users,
            title: t('premium.features.workExperience.title'),
            description: t('premium.features.workExperience.description'),
            badgeKey: "workExperience" as const,
        },
        {
            icon: FileText,
            title: t('premium.features.predictedPapers.title'),
            description: t('premium.features.predictedPapers.description'),
            badgeKey: "predictedPapers" as const,
        },
    ];

    // Check for Stripe redirect
    useEffect(() => {
        const success = searchParams.get("success");
        const canceled = searchParams.get("canceled");
        const sessionId = searchParams.get("session_id");

        if (success && sessionId) {
            toast.success("Payment successful! Your premium subscription is now active.");
            checkPremiumStatus();
            navigate("/premium-dashboard", { replace: true });
        } else if (canceled) {
            toast.info("Payment canceled. You can try again anytime.");
            navigate("/premium-dashboard", { replace: true });
        }
    }, [searchParams, navigate]);

    useEffect(() => {
        if (user) {
            checkPremiumStatus();
            checkContentAvailability();
        } else {
            setChecking(false);
            setCheckingContent(false);
        }
    }, [user]);

    const checkContentAvailability = async () => {
        if (!supabase) return;

        setCheckingContent(true);
        try {
            // Check for predicted papers
            const { count: papersCount } = await supabase
                .from("premium_predicted_papers")
                .select("*", { count: "exact", head: true })
                .eq("is_premium", true);

            setHasPredictedPapers((papersCount || 0) > 0);

            // Check for work experience
            const { count: workExpCount } = await supabase
                .from("premium_work_experience")
                .select("*", { count: "exact", head: true })
                .eq("is_premium", true)
                .eq("is_active", true);

            setHasWorkExperience((workExpCount || 0) > 0);
        } catch (error) {
            console.error("Error checking content availability:", error);
            setHasPredictedPapers(false);
            setHasWorkExperience(false);
        } finally {
            setCheckingContent(false);
        }
    };

    const checkPremiumStatus = async () => {
        if (!user || !supabase) return;

        setChecking(true);
        try {
            const premium = await hasPremium(supabase);
            setIsPremium(premium);

            if (premium) {
                const sub = await getPaymentSubscription(supabase);
                if (sub && !sub.error) {
                    setSubscription(sub.subscription);
                }
            }
        } catch (error) {
            console.error("Error checking premium status:", error);
        } finally {
            setChecking(false);
        }
    };

    const handleSubscribe = () => {
        setShowTerms(true);
    };

    const handleConfirmTerms = async () => {
        setShowTerms(false);
        if (!user || !supabase) return;
        setShowPayment(true);
    };

    const handlePaymentSuccess = async () => {
        setShowPayment(false);
        toast.success("Payment successful! Your premium access is now active. 🎉");
        setIsPremium(true);
        await checkPremiumStatus();
        navigate("/premium-dashboard", { replace: true });
    };

    const handleCancel = async () => {
        if (!supabase) return;

        setLoading(true);
        try {
            const result = await cancelPaymentSubscription(supabase);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success(result.message || "Subscription cancelled successfully.");
            await checkPremiumStatus();
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel subscription.");
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">

                {/* Header Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-600/20 p-8 border border-yellow-500/30">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400">
                                {isPremium ? t('premium.dashboard.welcomePremium') : t('premium.dashboard.unlockPotential')}
                            </h1>
                            <p className="text-muted-foreground mt-3 max-w-xl text-lg">
                                {isPremium
                                    ? t('premium.dashboard.premiumDescription')
                                    : t('premium.dashboard.freeDescription')}
                            </p>

                            {/* PROMOTION BANNER */}
                            {!isPremium && (
                                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 animate-pulse-subtle">
                                    <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                                        <Zap className="h-5 w-5" />
                                        LIMITED TIME OFFER
                                    </h3>
                                    <p className="text-foreground font-medium">
                                        Get full 2026 GCSE Season Access for just <span className="text-xl font-bold text-red-500">£25</span>!
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Unlock everything you need for your exams.
                                    </p>
                                </div>
                            )}
                        </div>

                        {!isPremium && (
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg border-0 text-base md:text-lg px-6 md:px-8 py-4 md:py-6 h-auto whitespace-nowrap shrink-0"
                                onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                {t('premium.dashboard.upgradeToPremium')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Current Subscription Status */}
                {isPremium && subscription && (
                    <div className="glass-card p-6 mb-8 animate-slide-up">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Check className="h-5 w-5 text-secondary" />
                                    <h3 className="text-lg font-semibold text-foreground">{t('premium.dashboard.activeSubscription')}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Premium — One-Time Purchase
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Purchased: {new Date(subscription.current_period_start).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Grid (Dashboard Tools) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {dashboardFeatures.map((feature, index) => (
                        <Card
                            key={index}
                            className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-primary/10 bg-card/50 backdrop-blur-sm cursor-pointer"
                            onClick={() => navigate(feature.path)}
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full ${feature.hoverBg} opacity-0 group-hover:opacity-100 transition-opacity`} />

                            <CardHeader>
                                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:bg-opacity-20 transition-all`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-2">
                                    {feature.description}
                                </CardDescription>
                            </CardHeader>

                            <CardFooter className="pt-0 flex justify-between items-center text-sm text-muted-foreground">
                                <span className="group-hover:text-primary transition-colors">
                                    {!isPremium ? t('premium.dashboard.premiumOnly') : t('premium.dashboard.launchTool')}
                                </span>
                                {!isPremium ? (
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <feature.icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300" />
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Feature Benefits Grid (Image 2) */}
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-foreground">
                            {isPremium ? t('premium.dashboard.yourBenefits') : t('premium.dashboard.premiumFeatures')}
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            {isPremium
                                ? t('premium.dashboard.benefitsDescriptionPremium')
                                : t('premium.dashboard.benefitsDescriptionFree')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {benefitFeatures.map((feature, index) => {
                            const f = feature as typeof feature & { badgeKey?: "workExperience" | "predictedPapers" };
                            const badge = f.badgeKey === "workExperience" ? (hasWorkExperience ? t('premium.dashboard.available') : t('premium.dashboard.comingSoon')) : f.badgeKey === "predictedPapers" ? (hasPredictedPapers ? t('premium.dashboard.available') : t('premium.dashboard.comingSoon')) : null;
                            return (
                                <div
                                    key={index}
                                    className="glass-card p-5 animate-slide-up"
                                    style={{ animationDelay: `${0.1 * index}s`, opacity: 0 }}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="p-2.5 rounded-xl bg-premium/10 w-fit">
                                            <feature.icon className="h-5 w-5 text-premium" />
                                        </div>
                                        {badge && (
                                            <Badge variant="secondary" className={cn("text-xs", (hasWorkExperience && f.badgeKey === "workExperience") || (hasPredictedPapers && f.badgeKey === "predictedPapers") ? "bg-premium/20 text-premium border-premium/30" : "bg-muted/50 text-muted-foreground")}>
                                                {badge}
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Premium Status Indicator (Locked Feature Demo) */}
                <div className="p-8 rounded-2xl border-2 border-dashed border-border bg-muted/30 text-center animate-slide-up">
                    <div className="relative inline-block mb-4">
                        <Brain className="h-16 w-16 text-muted-foreground/50" />
                        <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-premium">
                            <Crown className="h-4 w-4 text-premium-foreground" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{t('premium.dashboard.unlimitedAI')}</h3>
                    <p className="text-muted-foreground mb-4">
                        {t('premium.dashboard.unlimitedAIDescription')}
                    </p>
                    {isPremium ? (
                        <div className="flex items-center justify-center gap-2 text-secondary">
                            <Check className="h-5 w-5" />
                            <span className="font-medium">{t('premium.dashboard.accessGranted')}</span>
                        </div>
                    ) : (
                        <Button
                            className="bg-premium hover:bg-premium/90 text-premium-foreground mx-auto"
                            onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <Crown className="h-4 w-4 mr-2" />
                            {t('premium.dashboard.unlockPremium')}
                        </Button>
                    )}
                </div>

                {/* Sales Content (Only for non-premium users) */}
                {!isPremium && (
                    <div id="pricing-section" className="space-y-12 pt-12 border-t border-border/50">
                        {/* Pricing Card — One-Time Payment */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold mb-4">Get Premium</h2>
                            <p className="text-muted-foreground">One-time payment — no recurring charges</p>
                        </div>

                        <div className="max-w-lg mx-auto">
                            <div
                                className="relative rounded-2xl p-6 md:p-8 border-2 border-premium shadow-lg transition-all duration-300 animate-scale-in"
                                style={{ animationDelay: "0.3s", opacity: 0 }}
                            >
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="premium-badge">
                                        <Sparkles className="h-3 w-3 fill-current" />
                                        One-Time Payment
                                    </span>
                                </div>

                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Premium Access</h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold text-foreground">£1.00</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">One-time payment — no recurring charges</p>
                                    <p className="text-sm text-muted-foreground mt-2">Full access to all premium features for the 2026 GCSE season</p>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {[
                                        "All premium features",
                                        "No recurring charges",
                                        "Priority new features",
                                        "Exclusive content",
                                    ].map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                                            <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="w-full bg-premium hover:bg-premium/90 text-premium-foreground"
                                    onClick={() => handleSubscribe()}
                                    disabled={loading || isPremium}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {t('premium.dashboard.processing')}
                                        </>
                                    ) : isPremium ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            {t('premium.dashboard.alreadyPremium')}
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="h-4 w-4 mr-2" />
                                            Buy Premium — £1
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Guarantee */}
                        <div className="glass-card p-6 md:p-8 text-center max-w-2xl mx-auto">
                            <Shield className="h-10 w-10 text-secondary mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">{t('premium.dashboard.moneyBackGuarantee')}</h3>
                            <p className="text-muted-foreground">
                                {t('premium.dashboard.moneyBackDescription')}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <TermsDialog
                open={showTerms}
                onOpenChange={setShowTerms}
                onAccept={handleConfirmTerms}
            />

            {/* Payment Dialog with Stripe */}
            <Dialog open={showPayment} onOpenChange={setShowPayment}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-premium" />
                            Complete Payment securely with card
                        </DialogTitle>
                        <DialogDescription>
                            Pay £1.00 one-time to unlock all premium features.
                        </DialogDescription>
                    </DialogHeader>
                    <StripeCheckout
                        onSuccess={handlePaymentSuccess}
                        onError={(err) => console.error("Payment error:", err)}
                    />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
