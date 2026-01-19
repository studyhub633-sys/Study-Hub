import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Lightbulb, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Suggestion {
  title: string;
  description: string;
  action: string;
  path: string;
}

export function SuggestedResources() {
  const { supabase, user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSuggestions = async () => {
      try {
        const newSuggestions: Suggestion[] = [];

        // Check if user has notes
        const { count: notesCount } = await supabase
          .from("notes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Check if user has flashcards
        const { count: flashcardsCount } = await supabase
          .from("flashcards")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Check if user has past papers
        const { count: papersCount } = await supabase
          .from("past_papers")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Generate suggestions based on data
        if (notesCount === 0) {
          newSuggestions.push({
            title: "Create your first note",
            description: "Start organising your studies by creating exam notes.",
            action: "Get Started",
            path: "/notes",
          });
        } else if (notesCount && notesCount > 0) {
          newSuggestions.push({
            title: "Continue your notes",
            description: `You have ${notesCount} note${notesCount > 1 ? "s" : ""}. Keep adding more!`,
            action: "View Notes",
            path: "/notes",
          });
        }

        if (flashcardsCount === 0) {
          newSuggestions.push({
            title: "Create flashcards",
            description: "Build your flashcard deck to improve your memory retention.",
            action: "Create Cards",
            path: "/flashcards",
          });
        } else if (flashcardsCount && flashcardsCount > 0) {
          newSuggestions.push({
            title: "Review your flashcards",
            description: `You have ${flashcardsCount} flashcard${flashcardsCount > 1 ? "s" : ""}. Practice them regularly!`,
            action: "Practice Now",
            path: "/flashcards",
          });
        }

        if (papersCount === 0) {
          newSuggestions.push({
            title: "Try a past paper",
            description: "Practice with past papers to prepare for your exams.",
            action: "Add Papers",
            path: "/past-papers",
          });
        } else if (papersCount && papersCount > 0) {
          newSuggestions.push({
            title: "Complete a past paper",
            description: `You have ${papersCount} past paper${papersCount > 1 ? "s" : ""}. Challenge yourself!`,
            action: "Start Quiz",
            path: "/past-papers",
          });
        }

        setSuggestions(newSuggestions.slice(0, 3));
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [user, supabase]);

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
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading suggestions...</p>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No suggestions available. Start creating content to get personalized recommendations!</p>
          ) : (
            suggestions.map((suggestion, index) => (
              <Link
                key={index}
                to={suggestion.path}
                className="block p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 cursor-pointer group animate-slide-up"
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
              </Link>
            ))
          )}
        </div>

        {/* Premium CTA */}
        <div className="mt-4 p-4 rounded-xl border border-premium/30 bg-premium/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg flex-shrink-0" style={{ background: "var(--gradient-premium)" }}>
                <Sparkles className="h-5 w-5 text-premium-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Unlock AI-powered suggestions</p>
                <p className="text-sm text-muted-foreground">Get personalized study recommendations</p>
              </div>
            </div>
            <Button size="sm" className="w-full sm:w-auto bg-premium hover:bg-premium/90 text-premium-foreground shrink-0">
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
