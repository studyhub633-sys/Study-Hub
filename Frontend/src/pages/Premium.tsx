import { AppLayout } from "@/components/layout/AppLayout";
import { StripeCheckout } from "@/components/premium/StripeCheckout";
import { TermsDialog } from "@/components/premium/TermsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  cancelSubscription as cancelPaymentSubscription,
  getSubscription as getPaymentSubscription,
} from "@/lib/payment-client";
import { hasPremium } from "@/lib/premium";
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
  Layers,
  Loader2,
  Rocket,
  Shield,
  Sparkles,
  Users,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";



export default function Premium() {
  const { user, supabase } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Ensure t is destructured here
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [hasPredictedPapers, setHasPredictedPapers] = useState(false);
  const [hasWorkExperience, setHasWorkExperience] = useState(false);
  const [checkingContent, setCheckingContent] = useState(true);

  const features = [
    {
      icon: Brain,
      title: "AI Tutor & Homework Solver",
      description: "1-to-1 AI tutoring, step-by-step homework solutions, and unlimited practice questions. Free users get 10 prompts/day.",
      key: "aiTutor"
    },
    {
      icon: Sparkles,
      title: t("premium.features.studySuggestions.title"),
      description: t("premium.features.studySuggestions.description"),
      key: "studySuggestions"
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Receive detailed explanations and mark scheme breakdowns for every answer",
      key: "instantFeedback"
    },
    {
      icon: Clock,
      title: "Progress Analytics",
      description: "Advanced insights into your study patterns and performance trends",
      key: "progressAnalytics"
    },
    {
      icon: Shield,
      title: "Fully Ad-Free Experience",
      description: "Study without distractions with a completely ad-free interface",
      key: "adFree"
    },
    {
      icon: Users,
      title: "Priority Support",
      description: "Get help faster with dedicated premium customer support",
      key: "prioritySupport"
    },
    {
      icon: Brain,
      title: "Grade 9 Premium Notes",
      description: "Access exclusive Grade 9 notes and study materials",
      key: "grade9Notes"
    },
    {
      icon: Clock,
      title: "Homework Tracker",
      description: "Track assignments with smart notifications when they're due",
      key: "homeworkTracker"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Study Plans",
      description: "Get personalized study schedules based on your exam dates",
      key: "studyPlans"
    },
    {
      icon: Brain,
      title: "AI Mind Map Generator",
      description: "Transform your notes into visual mind maps instantly with AI",
      key: "mindMap"
    },
    {
      icon: GraduationCap,
      title: "AI Examiner",
      description: "Upload completed past papers for instant AI marking and grading",
      key: "aiExaminer"
    },
    {
      icon: BarChart3,
      title: "Performance Heat Map",
      description: "Visual red/amber/green analytics showing your strengths and weaknesses",
      key: "heatmap"
    },
  ];

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
      setHasPredictedPapers(false);
      setHasWorkExperience(false);
    } finally {
      setCheckingContent(false);
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
    navigate("/premium", { replace: true });
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
            <span className="font-semibold">Revisely.ai Premium</span>
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
              ? t("premium.page.descriptionPremium")
              : t("premium.page.description")}
          </p>

          {!isPremium && (
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20 animate-pulse-subtle"
              onClick={() => handleSubscribe()}
            >
              <Rocket className="mr-2 h-5 w-5" />
              {t("premium.page.upgradeNow")}
            </Button>
          )}
        </div>

        {/* 🎉 PROMOTION BANNER */}
        {!isPremium && (
          <div className="mb-12 animate-slide-up">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-1">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-pulse opacity-50"></div>
              <div className="relative rounded-xl bg-background/95 backdrop-blur-sm p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-bounce">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                      <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                        <span className="text-sm font-semibold text-emerald-500 uppercase tracking-wide">🎉 Limited Time Offer</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                        <span className="text-emerald-500">£25</span> for the full 2026 GCSE Season!
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        Get complete access to all premium features until your exams are done
                      </p>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 whitespace-nowrap"
                    onClick={() => handleSubscribe()}
                  >
                    <Crown className="mr-2 h-5 w-5" />
                    Claim Offer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Subscription Status */}
        {isPremium && subscription && (
          <div className="glass-card p-6 mb-8 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-secondary" />
                  <h3 className="text-lg font-semibold text-foreground">{t("premium.status.active")}</h3>
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
              <h3 className="font-semibold text-foreground mb-1">
                {/* Attempt to translate using key if available, else fall back to title */}
                {feature.key ? t(`premium.features.${feature.key}.title`, feature.title) : feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.key ? t(`premium.features.${feature.key}.description`, feature.description) : feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing Card — One-Time Payment */}
        {!isPremium && (
          <div className="max-w-lg mx-auto mb-12">
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
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Premium Access
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">£1.00</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">One-time payment — no recurring charges</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Full access to all premium features for the 2026 GCSE season
                </p>
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
                    {t("premium.dashboard.processing")}
                  </>
                ) : isPremium ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t("premium.dashboard.alreadyPremium")}
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
                  ? t("premium.dashboard.premiumFeatures")
                  : t("premium.dashboard.premiumFeatures") + " - " + t("premium.dashboard.comingSoon")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {hasPredictedPapers || hasWorkExperience
                  ? t("premium.dashboard.benefitsDescriptionPremium")
                  : t("premium.dashboard.benefitsDescriptionFree")}
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
                    {hasWorkExperience ? t("premium.dashboard.available") : t("premium.dashboard.comingSoon")}
                  </Badge>
                )}
              </div>

              <h4 className="font-semibold text-lg text-foreground mb-2 group-hover:text-premium transition-colors">
                Revisely.ai Work Experience
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Exclusive work experience opportunities specifically for Revisely.ai premium members
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
                    {hasPredictedPapers ? t("premium.dashboard.available") : t("premium.dashboard.comingSoon")}
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

            {/* Grade 9 Notes Card */}
            <div
              className="glass-card p-6 hover-lift cursor-pointer group relative overflow-hidden transition-all duration-300"
              onClick={() => navigate("/premium/grade-9-notes")}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-premium opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-premium/10 group-hover:bg-premium/20 transition-colors">
                  <FileText className="h-6 w-6 text-premium" />
                </div>
                <Badge className="bg-premium/20 text-premium border-premium/30 text-xs font-semibold">
                  Available
                </Badge>
              </div>
              <h4 className="font-semibold text-lg text-foreground mb-2 group-hover:text-premium transition-colors">
                Grade 9 Premium Notes
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Exclusive study notes designed for achieving top marks in your GCSEs
              </p>
              <div className="mt-4 pt-4 border-t border-border/50">
                <span className="text-xs text-premium font-medium flex items-center gap-1">
                  View Notes
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </div>

            {/* Grade 9 Flashcards Card */}
            <div
              className="glass-card p-6 hover-lift cursor-pointer group relative overflow-hidden transition-all duration-300"
              onClick={() => navigate("/premium/grade-9-flashcards")}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-premium opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-premium/10 group-hover:bg-premium/20 transition-colors">
                  <Layers className="h-6 w-6 text-premium" />
                </div>
                <Badge className="bg-muted/50 text-muted-foreground text-xs font-semibold">
                  Coming Soon
                </Badge>
              </div>
              <h4 className="font-semibold text-lg text-foreground mb-2 group-hover:text-premium transition-colors">
                Grade 9 Flashcards
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Premium flashcard sets to help you commit key concepts to memory
              </p>
            </div>

            {/* Cram Mode Card */}
            <div
              className="glass-card p-6 hover-lift cursor-pointer group relative overflow-hidden transition-all duration-300"
              onClick={() => navigate("/cram-mode")}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                  <Zap className="h-6 w-6 text-orange-500" />
                </div>
                <Badge className="bg-muted/50 text-muted-foreground text-xs font-semibold">
                  Coming Soon
                </Badge>
              </div>
              <h4 className="font-semibold text-lg text-foreground mb-2 group-hover:text-orange-500 transition-colors">
                Cram Mode
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Intensive study sessions designed to maximize revision efficiency before exams
              </p>
            </div>
          </div>
        </div>

        {/* FAQ / Guarantee */}
        <div className="glass-card p-6 md:p-8 text-center animate-slide-up" style={{ animationDelay: "0.6s", opacity: 0 }}>
          <Shield className="h-10 w-10 text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t("premium.dashboard.moneyBackGuarantee")}</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t("premium.dashboard.moneyBackDescription")}
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
          <h3 className="text-lg font-semibold text-foreground mb-2">{t("premium.dashboard.unlimitedAI")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("premium.dashboard.unlimitedAIDescription")}
          </p>
          {isPremium ? (
            <div className="flex items-center gap-2 text-secondary">
              <Check className="h-5 w-5" />
              <span className="font-medium">{t("premium.dashboard.accessGranted")}</span>
            </div>
          ) : (
            <Button
              className="bg-premium hover:bg-premium/90 text-premium-foreground"
              onClick={() => handleSubscribe()}
              disabled={loading}
            >
              <Crown className="h-4 w-4 mr-2" />
              {t("premium.dashboard.unlockPremium")}
            </Button>
          )}
        </div>
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
