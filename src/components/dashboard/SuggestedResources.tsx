import { Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const suggestions = [
  {
    title: "Complete your Biology revision",
    description: "You've covered 60% of the Cell Biology topic. Keep going!",
    action: "Continue",
    path: "/notes",
  },
  {
    title: "Review weak flashcards",
    description: "12 cards need more practice based on your quiz results.",
    action: "Practice Now",
    path: "/flashcards",
  },
  {
    title: "Try a timed past paper",
    description: "Challenge yourself with a Chemistry paper under exam conditions.",
    action: "Start Quiz",
    path: "/past-papers",
  },
];

export function SuggestedResources() {
  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-accent/20">
            <Lightbulb className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Suggested for You</h3>
            <p className="text-xs text-muted-foreground">Based on your activity</p>
          </div>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-1">{suggestion.title}</p>
                  <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                </div>
                <Button size="sm" variant="ghost" className="flex-shrink-0 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {suggestion.action}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Premium CTA */}
        <div className="mt-4 p-4 rounded-xl border border-premium/30 bg-premium/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: "var(--gradient-premium)" }}>
              <Sparkles className="h-5 w-5 text-premium-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Unlock AI-powered suggestions</p>
              <p className="text-sm text-muted-foreground">Get personalized study recommendations</p>
            </div>
            <Button size="sm" className="bg-premium hover:bg-premium/90 text-premium-foreground">
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
