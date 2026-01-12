import { AppLayout } from "@/components/layout/AppLayout";
import { TermsDialog } from "@/components/premium/TermsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { validateDiscountCode } from "@/lib/discount";
import { getSubscription as getPaymentSubscription } from "@/lib/payment-client";
import { grantBetaAccessWithBackend, hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    Brain,
    Calculator,
    Calendar,
    Check,
    CheckCircle,
    FileText,
    GraduationCap,
    Loader2,
    Lock,
    Network,
    Rocket,
    Shield,
    Sparkles,
    Star,
    Ticket,
    Timer,
    Trophy,
    Users,
    X,
    Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const plans = [
    {
        name: "Monthly",
        price: "£4.99",
        period: "/month",
        description: "Perfect for trying out premium features",
        features: [
            "All premium features",
            "Cancel anytime",
            "Monthly billing",
        ],
        popular: false,
    },
    {
        name: "Yearly",
        price: "£39.99",
        period: "/year",
        description: "Our best value - save over £19 annually!",
        features: [
            "All premium features",
            "4 months free",
            "Priority new features",
            "Exclusive content",
        ],
        popular: true,
        savings: "Save £19.89",
    },
];

export default function PremiumDashboard() {
    const { user, supabase } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { theme } = useTheme();
    const [isPremium, setIsPremium] = useState(false);
    const [checking, setChecking] = useState(true);
    const [subscription, setSubscription] = useState<any>(null);
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | null>(null);

    // Dashboard-specific feature list (Tools)
    const dashboardFeatures = [
        {
            title: "AI Homework Solver",
            description: "Get instant step-by-step solutions for any subject question.",
            icon: Brain,
            path: "/premium/homework-solver",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: "Note Condenser",
            description: "Turn pages of notes into concise summaries and flashcards.",
            icon: FileText,
            path: "/premium/note-condenser",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Predicted Grades",
            description: "Calculate your potential grades based on current performance.",
            icon: Calculator,
            path: "/premium/predicted-grades",
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: "Focus Mode",
            description: "Distraction-free study timer with Pomodoro technique.",
            icon: Timer,
            path: "/premium/focus-mode",
            color: "text-red-500",
            bg: "bg-red-500/10",
        },
        {
            title: "Leaderboards",
            description: "Compete with other students and track your study streaks.",
            icon: Trophy,
            path: "/premium/leaderboard",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            title: "Virtual Sessions",
            description: "Join weekly group revision sessions led by expert tutors.",
            icon: Users,
            path: "/premium/virtual-sessions",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
        },
        {
            title: "Homework Tracker",
            description: "Track assignments with smart notifications when they're due.",
            icon: Calendar,
            path: "/premium/homework-tracker",
            color: "text-pink-500",
            bg: "bg-pink-500/10",
        },
        {
            title: "AI Study Plans",
            description: "Get personalized study schedules based on your exam dates.",
            icon: Sparkles,
            path: "/premium/study-plans",
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
        },
        {
            title: "AI Mind Map Generator",
            description: "Transform your notes into visual mind maps instantly with AI.",
            icon: Network,
            path: "/premium/mind-map-generator",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: "AI Examiner",
            description: "Upload completed past papers for instant AI marking and grading.",
            icon: GraduationCap,
            path: "/premium/ai-examiner",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Performance Heat Map",
            description: "Visual red/amber/green analytics showing your strengths and weaknesses.",
            icon: BarChart3,
            path: "/premium/performance-heatmap",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
    ];

    // Feature Benefits list (Image 2 content)
    const benefitFeatures = [
        {
            icon: Brain,
            title: "Unlimited AI Question Generation",
            description: "Generate unlimited AI questions tailored to your exam board and subjects (50/day for free users)",
        },
        {
            icon: Sparkles,
            title: "Groq AI Study Suggestions",
            description: "Get personalized study recommendations based on your progress and weak areas",
        },
        {
            icon: Zap,
            title: "Instant Feedback",
            description: "Receive detailed explanations and mark scheme breakdowns for every answer",
        },
        {
            icon: Timer,
            title: "Progress Analytics",
            description: "Advanced insights into your study patterns and performance trends",
        },
        {
            icon: Shield,
            title: "Fully Ad-Free Experience",
            description: "Study without distractions with a completely ad-free interface",
        },
        {
            icon: Users,
            title: "Priority Support",
            description: "Get help faster with dedicated premium customer support",
        },
        {
            icon: Brain,
            title: "Grade 9 Premium Notes",
            description: "Access exclusive Grade 9 notes and study materials",
        },
        {
            icon: Timer,
            title: "Homework Tracker",
            description: "Track assignments with smart notifications when they're due",
        },
        {
            icon: Sparkles,
            title: "AI-Powered Study Plans",
            description: "Get personalized study schedules based on your exam dates",
        },
        {
            icon: Brain,
            title: "AI Mind Map Generator",
            description: "Transform your notes into visual mind maps instantly with AI",
        },
        {
            icon: GraduationCap,
            title: "AI Examiner",
            description: "Upload completed past papers for instant AI marking and grading",
        },
        {
            icon: BarChart3,
            title: "Performance Heat Map",
            description: "Visual red/amber/green analytics showing your strengths and weaknesses",
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
        } else {
            setChecking(false);
        }
    }, [user]);

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

    const handleSubscribe = async (planType: "monthly" | "yearly") => {
        setSelectedPlan(planType);
        setShowTerms(true);
    };

    const handleConfirmTerms = async () => {
        setShowTerms(false);
        if (!user || !supabase) return;

        setLoading(true);
        try {
            const result = await grantBetaAccessWithBackend(supabase);
            if (result.success) {
                setIsPremium(true);
                await checkPremiumStatus();
                toast.success("Lifetime beta access granted!");
            } else {
                toast.error(`Failed: ${result.error || "Please try again."}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleApplyCode = () => {
        if (!discountCode) return;

        const discount = validateDiscountCode(discountCode);
        if (discount) {
            setAppliedDiscount(discount);
            toast.success(`Discount code applied: ${discount.description} `);
            if (discount.type === "free_lifetime") {
                toast.info("This code provides lifetime free access!");
            }
        } else {
            toast.error("Invalid discount code");
        }
    };

    const handleCancel = async () => {
        toast.info("Subscriptions are currently disabled during beta testing.");
    };

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">

                {/* Header Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-600/20 p-8 border border-yellow-500/30">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400">
                                {isPremium ? "Welcome, Premium Member!" : "Unlock Your Potential"}
                            </h1>
                            <p className="text-muted-foreground mt-3 max-w-xl text-lg">
                                {isPremium
                                    ? "Thank you for upgrading! Enjoy unlimited access to all our advanced AI tools and study features."
                                    : "Access advanced AI tools, exclusive content, and powerful study features designed to boost your grades."}
                            </p>
                        </div>

                        {!isPremium && (
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg border-0 text-lg px-8 py-6 h-auto"
                                onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Upgrade to Premium
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
                                    <h3 className="text-lg font-semibold text-foreground">Active Premium Subscription</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Plan: <span className="font-medium text-foreground capitalize">{subscription.plan_type}</span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
                                </p>
                                {subscription.cancel_at_period_end && (
                                    <p className="text-sm text-destructive mt-2">
                                        ⚠️ Subscription will cancel at the end of the billing period
                                    </p>
                                )}
                            </div>
                            {!subscription.cancel_at_period_end && (
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <X className="h-4 w-4 mr-2" />
                                    )}
                                    Cancel Subscription
                                </Button>
                            )}
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
                            <div className={`absolute top-0 left-0 w-1 h-full ${feature.bg.replace('/10', '')} opacity-0 group-hover:opacity-100 transition-opacity`} />

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
                                    {!isPremium ? "Premium Only" : "Launch Tool"}
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
                            {isPremium ? "Your Premium Benefits" : "Premium Features"}
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            {isPremium
                                ? "You have full access to these exclusive features"
                                : "Everything you get when you upgrade to Scientia.ai Premium"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {benefitFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="glass-card p-5 hover-lift animate-slide-up"
                                style={{ animationDelay: `${0.1 * index}s`, opacity: 0 }}
                            >
                                <div className="p-2.5 rounded-xl bg-premium/10 w-fit mb-3">
                                    <feature.icon className="h-5 w-5 text-premium" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales Content (Only for non-premium users) */}
                {!isPremium && (
                    <div id="pricing-section" className="space-y-12 pt-12 border-t border-border/50">
                        {/* Pricing Cards */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
                            <p className="text-muted-foreground">Unlock unlimited access to all AI tools and features</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {plans.map((plan, index) => (
                                <div
                                    key={plan.name}
                                    className={cn(
                                        "relative rounded-2xl p-6 md:p-8 transition-all duration-300 animate-scale-in",
                                        plan.popular
                                            ? "border-2 border-premium shadow-lg"
                                            : "glass-card"
                                    )}
                                    style={{ animationDelay: `${0.3 + 0.1 * index} s`, opacity: 0 }}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="premium-badge">
                                                <Star className="h-3 w-3 fill-current" />
                                                Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                                            <span className="text-muted-foreground">{plan.period}</span>
                                        </div>
                                        {plan.savings && (
                                            <span className="inline-block mt-2 text-sm font-medium text-secondary px-2 py-0.5 bg-secondary/10 rounded-full">
                                                {plan.savings}
                                            </span>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                                                <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className={cn(
                                            "w-full",
                                            plan.popular
                                                ? "bg-premium hover:bg-premium/90 text-premium-foreground"
                                                : ""
                                        )}
                                        variant={plan.popular ? "default" : "outline"}
                                        onClick={() => handleSubscribe(plan.name.toLowerCase() as "monthly" | "yearly")}
                                        disabled={loading || isPremium}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : isPremium ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Already Premium
                                            </>
                                        ) : (
                                            <>
                                                {plan.popular && <Rocket className="h-4 w-4 mr-2" />}
                                                Get Lifetime Access (Beta)
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Discount Code */}
                        <div className="glass-card p-6 max-w-2xl mx-auto">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Ticket className="h-5 w-5 text-premium" />
                                        <h3 className="text-lg font-semibold text-foreground">Have a discount code?</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter code (e.g., FREE_BETA)"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                            className="max-w-xs"
                                        />
                                        <Button variant="secondary" onClick={handleApplyCode}>
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                                {appliedDiscount && (
                                    <div className="p-4 rounded-xl bg-premium/10 border border-premium/20 w-full md:w-auto">
                                        <div className="text-sm font-semibold text-premium mb-1">Applied:</div>
                                        <div className="text-lg font-bold text-foreground">{appliedDiscount.code}</div>
                                        <div className="text-xs text-muted-foreground">{appliedDiscount.description}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Guarantee */}
                        <div className="glass-card p-6 md:p-8 text-center max-w-2xl mx-auto">
                            <Shield className="h-10 w-10 text-secondary mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">30-Day Money-Back Guarantee</h3>
                            <p className="text-muted-foreground">
                                Not satisfied? Get a full refund within 30 days, no questions asked.
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
        </AppLayout>
    );
}
