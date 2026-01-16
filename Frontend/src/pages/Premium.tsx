import { AppLayout } from "@/components/layout/AppLayout";
import { TermsDialog } from "@/components/premium/TermsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { validateDiscountCode } from "@/lib/discount";
import { getSubscription as getPaymentSubscription } from "@/lib/payment-client";
import { grantBetaAccessWithBackend, hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Brain,
  Check,
  CheckCircle,
  Clock,
  Crown,
  FileText,
  GraduationCap,
  Loader2,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Ticket,
  Users,
  X,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const features = [
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
    icon: Clock,
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
    icon: Clock,
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

export default function Premium() {
  const { user, supabase } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [applyingCode, setApplyingCode] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | null>(null);
  const [hasPredictedPapers, setHasPredictedPapers] = useState(false);
  const [hasWorkExperience, setHasWorkExperience] = useState(false);
  const [checkingContent, setCheckingContent] = useState(true);

  // Check for Stripe redirect
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const sessionId = searchParams.get("session_id");

    if (success && sessionId) {
      toast.success("Payment successful! Your premium subscription is now active.");
      // Refresh subscription status
      checkPremiumStatus();
      // Clean URL
      navigate("/premium-dashboard", { replace: true });
    } else if (canceled) {
      toast.info("Payment canceled. You can try again anytime.");
      navigate("/premium-dashboard", { replace: true });
    }
  }, [searchParams, navigate]);

  // Check premium status on mount
  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      checkContentAvailability();
    } else {
      setCheckingStatus(false);
      setCheckingContent(false);
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user || !supabase) return;

    setCheckingStatus(true);
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
      setCheckingStatus(false);
    }
  };

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
      // If tables don't exist yet, assume coming soon
      setHasPredictedPapers(false);
      setHasWorkExperience(false);
    } finally {
      setCheckingContent(false);
    }
  };

  const handleSubscribe = async (planType: "monthly" | "yearly") => {
    // BETA MODE: Prompt for terms first
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
        setIsPremium(true); // Immediate UI update
        await checkPremiumStatus(); // Refresh status
        toast.success("Lifetime beta access granted!");
      } else {
        toast.error(`Failed: ${result.error || "Please try again."}`);
        console.error("Grant failure details:", result.error);
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

  const handleApplyLifetime = async () => {
    if (!user || !supabase) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Lifetime premium access granted!");
      setIsPremium(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to grant premium access");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    toast.info("Subscriptions are currently disabled during beta testing.");
  };

  if (checkingStatus) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-premium/10 text-premium mb-6">
            <Crown className="h-5 w-5" />
            <span className="font-semibold">Scientia.ai Premium</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {isPremium ? (
              <>
                You're a <span className="gradient-text-premium">Premium Member</span>
              </>
            ) : (
              <>
                Supercharge Your
                <span className="gradient-text-premium"> Learning</span>
              </>
            )}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {isPremium
              ? "You have lifetime access to all premium features during our beta testing phase."
              : "During beta, premium features are reserved for authorized tester accounts."}
          </p>

          {!isPremium && (
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20 animate-pulse-subtle"
              onClick={() => handleSubscribe("yearly")}
            >
              <Rocket className="mr-2 h-5 w-5" />
              UPGRADE NOW
            </Button>
          )}
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

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-5 hover-lift animate-slide-up"
              style={{ animationDelay: `${0.1 * index} s`, opacity: 0 }}
            >
              <div className="p-2.5 rounded-xl bg-premium/10 w-fit mb-3">
                <feature.icon className="h-5 w-5 text-premium" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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

        {/* Discount Code Section */}
        {!isPremium && (
          <div className="glass-card p-6 mb-12 animate-slide-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="h-5 w-5 text-premium" />
                  <h3 className="text-lg font-semibold text-foreground">Have a discount code?</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your code below to unlock premium access or get a special discount.
                </p>
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
        )}

        {/* Coming Soon Features */}
        <div className="mb-12 animate-slide-up" style={{ animationDelay: "0.5s", opacity: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-premium/10">
              <Rocket className="h-6 w-6 text-premium" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {hasPredictedPapers || hasWorkExperience
                  ? "Premium Features"
                  : "Coming Soon - Premium Features"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {hasPredictedPapers || hasWorkExperience
                  ? "Exclusive features available to premium members"
                  : "Exciting new features launching soon"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Work Experience Card */}
            <div
              className={cn(
                "glass-card p-6 hover-lift cursor-pointer group relative overflow-hidden transition-all duration-300",
                checkingContent && "opacity-60 cursor-not-allowed"
              )}
              onClick={() => !checkingContent && navigate("/premium/work-experience")}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-premium opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-premium/10 group-hover:bg-premium/20 transition-colors">
                  <Users className="h-6 w-6 text-premium" />
                </div>
                {checkingContent ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Badge
                    variant={hasWorkExperience ? "default" : "secondary"}
                    className={cn(
                      "text-xs font-semibold",
                      hasWorkExperience
                        ? "bg-premium/20 text-premium border-premium/30"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {hasWorkExperience ? "Available" : "Coming Soon"}
                  </Badge>
                )}
              </div>

              <h4 className="font-semibold text-lg text-foreground mb-2 group-hover:text-premium transition-colors">
                Scientia.ai Work Experience
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Exclusive work experience opportunities specifically for Scientia.ai premium members
              </p>

              {hasWorkExperience && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <span className="text-xs text-premium font-medium flex items-center gap-1">
                    View Opportunities
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              )}
            </div>

            {/* Predicted Papers Card */}
            <div
              className={cn(
                "glass-card p-6 hover-lift cursor-pointer group relative overflow-hidden transition-all duration-300",
                checkingContent && "opacity-60 cursor-not-allowed"
              )}
              onClick={() => !checkingContent && navigate("/premium/predicted-papers")}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-premium opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-premium/10 group-hover:bg-premium/20 transition-colors">
                  <FileText className="h-6 w-6 text-premium" />
                </div>
                {checkingContent ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Badge
                    variant={hasPredictedPapers ? "default" : "secondary"}
                    className={cn(
                      "text-xs font-semibold",
                      hasPredictedPapers
                        ? "bg-premium/20 text-premium border-premium/30"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {hasPredictedPapers ? "Available" : "Coming Soon"}
                  </Badge>
                )}
              </div>

              <h4 className="font-semibold text-lg text-foreground mb-2 group-hover:text-premium transition-colors">
                2026 Predicted Papers
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access exclusive 2026 predicted exam papers before they're released publicly
              </p>

              {hasPredictedPapers && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <span className="text-xs text-premium font-medium flex items-center gap-1">
                    Browse Papers
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FAQ / Guarantee */}
        <div className="glass-card p-6 md:p-8 text-center animate-slide-up" style={{ animationDelay: "0.6s", opacity: 0 }}>
          <Shield className="h-10 w-10 text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">30-Day Money-Back Guarantee</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Not satisfied? Get a full refund within 30 days, no questions asked.
            We're confident you'll love Scientia.ai Premium.
          </p>
        </div>

        {/* Locked Feature Demo */}
        <div className="mt-12 p-8 rounded-2xl border-2 border-dashed border-border bg-muted/30 text-center animate-slide-up" style={{ animationDelay: "0.6s", opacity: 0 }}>
          <div className="relative inline-block mb-4">
            <Brain className="h-16 w-16 text-muted-foreground/50" />
            <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-premium">
              <Crown className="h-4 w-4 text-premium-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Unlimited AI Content Generation</h3>
          <p className="text-muted-foreground mb-4">
            This feature is available for Premium members only.
            Upgrade to access unlimited AI-generated questions, flashcards, and study materials.
            Free users get 50 AI requests per day.
          </p>
          {isPremium ? (
            <div className="flex items-center gap-2 text-secondary">
              <Check className="h-5 w-5" />
              <span className="font-medium">You have access to this feature!</span>
            </div>
          ) : (
            <Button
              className="bg-premium hover:bg-premium/90 text-premium-foreground"
              onClick={() => handleSubscribe("yearly")}
              disabled={loading}
            >
              <Crown className="h-4 w-4 mr-2" />
              Unlock Premium
            </Button>
          )}
        </div>
      </div>

      <TermsDialog
        open={showTerms}
        onOpenChange={setShowTerms}
        onAccept={handleConfirmTerms}
      />
    </AppLayout>
  );
}
