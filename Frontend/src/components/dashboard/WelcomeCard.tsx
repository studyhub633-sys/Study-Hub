import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremium } from "@/lib/premium";
import { Brain, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export function WelcomeCard() {
  const { supabase, user } = useAuth();
  const [profile, setProfile] = useState<{ full_name?: string; email?: string } | null>(null);
  const [stats, setStats] = useState({
    notesCount: 0,
    flashcardsCount: 0,
    papersCount: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [aiUsage, setAiUsage] = useState<{ count: number; limit: number; isPremium: boolean } | null>(null);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch counts
        const [notesResult, flashcardsResult, papersResult] = await Promise.all([
          supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("flashcards").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("past_papers").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        ]);

        setStats({
          notesCount: notesResult.count || 0,
          flashcardsCount: flashcardsResult.count || 0,
          papersCount: papersResult.count || 0,
          streak: 0, // TODO: Calculate streak from activity data
        });

        // Fetch AI usage
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: aiCount } = await supabase
          .from("ai_usage_tracking")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gt("created_at", oneDayAgo);

        // Get limit based on premium
        const isPremium = await hasPremium(supabase, user.id);
        setAiUsage({ count: aiCount || 0, limit: isPremium ? 500 : 10, isPremium });

      } catch (error) {
        console.error("Error fetching welcome card data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, supabase]);

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "there";

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 md:p-8" style={{ background: "var(--gradient-primary)" }}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{greeting}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">
              Welcome back, {displayName}!
            </h2>
            <p className="text-primary-foreground/80 max-w-md">
              {loading ? "Loading your progress..." : stats.notesCount + stats.flashcardsCount + stats.papersCount === 0
                ? "Get started by creating your first note, flashcard, or past paper!"
                : "You're making great progress. Keep up the momentum!"}
            </p>
            {aiUsage && (
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => window.location.href = '/knowledge'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors text-sm font-medium backdrop-blur-md"
                >
                  <Brain className="h-4 w-4" />
                  Generate with AI
                  <span className="text-xs opacity-80 ml-1">
                    {aiUsage.isPremium ? "(Lifetime Access)" : `(${aiUsage.limit - aiUsage.count} left)`}
                  </span>
                </button>
              </div>
            )}
          </div>

          {stats.notesCount + stats.flashcardsCount + stats.papersCount > 0 && (
            <div className="glass-card bg-white/10 backdrop-blur-sm border-white/20 p-4 rounded-xl min-w-[160px]">
              <div className="flex items-center gap-2 text-primary-foreground/80 text-sm mb-2">
                <TrendingUp className="h-4 w-4" />
                <span>Total Items</span>
              </div>
              <div className="text-3xl font-bold text-primary-foreground mb-2">
                {stats.notesCount + stats.flashcardsCount + stats.papersCount}
              </div>
              <Progress
                value={Math.min(100, ((stats.notesCount + stats.flashcardsCount + stats.papersCount) / 100) * 100)}
                className="h-2 bg-white/20"
              />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Notes", value: stats.notesCount.toString(), change: stats.notesCount === 0 ? "None yet" : "Created" },
            { label: "Flashcards", value: stats.flashcardsCount.toString(), change: stats.flashcardsCount === 0 ? "None yet" : "Created" },
            { label: "Past Papers", value: stats.papersCount.toString(), change: stats.papersCount === 0 ? "None yet" : "Added" },
            { label: "Study Streak", value: stats.streak > 0 ? `${stats.streak} days` : "0 days", change: stats.streak > 0 ? "🔥 Keep going!" : "Start studying!" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
            >
              <p className="text-primary-foreground/70 text-xs mb-1">{stat.label}</p>
              <p className="text-primary-foreground font-bold text-lg">{stat.value}</p>
              <p className="text-primary-foreground/60 text-xs mt-0.5">{stat.change}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
