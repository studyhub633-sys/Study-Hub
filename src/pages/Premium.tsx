import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Sparkles,
  Brain,
  Zap,
  CheckCircle,
  Star,
  Rocket,
  Shield,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Brain,
    title: "AI Question Bank",
    description: "Access 500+ AI-generated questions tailored to your exam board and subjects",
  },
  {
    icon: Sparkles,
    title: "Medley AI Study Suggestions",
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
    title: "Ad-Free Experience",
    description: "Study without distractions with a completely ad-free interface",
  },
  {
    icon: Users,
    title: "Priority Support",
    description: "Get help faster with dedicated premium customer support",
  },
];

const plans = [
  {
    name: "Monthly",
    price: "£5.99",
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
    price: "£65.99",
    period: "/year",
    description: "Best value - save over £6!",
    features: [
      "All premium features",
      "2 months free",
      "Priority new features",
      "Exclusive content",
    ],
    popular: true,
    savings: "Save £6",
  },
];

export default function Premium() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-premium/10 text-premium mb-6">
            <Crown className="h-5 w-5" />
            <span className="font-semibold">Study Hub Premium</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Supercharge Your
            <span className="gradient-text-premium"> Learning</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock AI-powered study tools, personalized recommendations, and advanced analytics to achieve your best grades.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {features.map((feature, index) => (
            <div
              key={feature.title}
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
              style={{ animationDelay: `${0.3 + 0.1 * index}s`, opacity: 0 }}
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
              >
                {plan.popular && <Rocket className="h-4 w-4 mr-2" />}
                Get {plan.name}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ / Guarantee */}
        <div className="glass-card p-6 md:p-8 text-center animate-slide-up" style={{ animationDelay: "0.5s", opacity: 0 }}>
          <Shield className="h-10 w-10 text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">30-Day Money-Back Guarantee</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Not satisfied? Get a full refund within 30 days, no questions asked. 
            We're confident you'll love Study Hub Premium.
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
          <h3 className="text-lg font-semibold text-foreground mb-2">AI Question Bank</h3>
          <p className="text-muted-foreground mb-4">
            This feature is available for Premium members only.
            Upgrade to access 500+ AI-generated practice questions.
          </p>
          <Button className="bg-premium hover:bg-premium/90 text-premium-foreground">
            <Crown className="h-4 w-4 mr-2" />
            Unlock Premium
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
