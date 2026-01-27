import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremium } from "@/lib/premium";
import { Brain, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function WelcomeCard() {
  const { supabase, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const greeting = currentHour < 12 ? t("dashboard.welcome.goodMorning") : currentHour < 18 ? t("dashboard.welcome.goodAfternoon") : t("dashboard.welcome.goodEvening");

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

        // Fetch counts and activity for streak (study_sessions, notes, flashcards)
        const [notesResult, flashcardsResult, papersResult, sessionsResult, notesDates, flashcardsDates] = await Promise.all([
          supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("flashcards").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("past_papers").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("study_sessions").select("date").eq("user_id", user.id),
          supabase.from("notes").select("updated_at").eq("user_id", user.id),
          supabase.from("flashcards").select("updated_at").eq("user_id", user.id),
        ]);

        const toYMD = (d: Date) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const dates = new Set<string>();
        (sessionsResult.data || []).forEach((r: any) => dates.add(toYMD(new Date(r.date))));
        (notesDates.data || []).forEach((r: any) => dates.add(toYMD(new Date(r.updated_at))));
        (flashcardsDates.data || []).forEach((r: any) => dates.add(toYMD(new Date(r.updated_at))));

        const streak = (() => {
          if (dates.size === 0) return 0;
          const today = toYMD(new Date());
          const yesterday = toYMD(new Date(Date.now() - 864e5));
          let ref: string;
          if (dates.has(today)) ref = today;
          else if (dates.has(yesterday)) ref = yesterday;
          else return 0;
          let count = 0;
          let d = ref;
          while (dates.has(d)) {
            count++;
            const [y, m, day] = d.split("-").map(Number);
            const next = new Date(y, m - 1, day - 1);
            d = toYMD(next);
          }
          return count;
        })();

        setStats({
          notesCount: notesResult.count || 0,
          flashcardsCount: flashcardsResult.count || 0,
          papersCount: papersResult.count || 0,
          streak,
        });

        // Fetch AI usage
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: aiCount } = await supabase
          .from("ai_usage_tracking")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gt("created_at", oneDayAgo);

        // Get limit based on premium
        const isPremium = await hasPremium(supabase);
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
              {t("dashboard.welcome.welcomeBack", { name: displayName })}
            </h2>
            <p className="text-primary-foreground/80 max-w-md">
              {loading ? t("dashboard.welcome.loading") : stats.notesCount + stats.flashcardsCount + stats.papersCount === 0
                ? t("dashboard.welcome.getStarted")
                : t("dashboard.welcome.makingProgress")}
            </p>
            {aiUsage && (
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => navigate('/ai-tutor')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors text-sm font-medium backdrop-blur-md"
                >
                  <Brain className="h-4 w-4" />
                  {t("dashboard.welcome.chatWithAI")}
                  <span className="text-xs opacity-80 ml-1">
                    {aiUsage.isPremium ? `(${t("dashboard.welcome.lifetimeAccess")})` : `(${aiUsage.limit - aiUsage.count} ${t("common.left")})`}
                  </span>
                </button>

                {!aiUsage.isPremium && (
                  <button
                    onClick={() => navigate('/premium-dashboard')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-premium hover:bg-premium/90 text-premium-foreground transition-all shadow-lg shadow-premium/20 text-sm font-bold border border-premium-foreground/20 animate-pulse-subtle"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t("dashboard.welcome.unlockLifetime")}
                  </button>
                )}
              </div>
            )}
          </div>

          {stats.notesCount + stats.flashcardsCount + stats.papersCount > 0 && (
            <div className="glass-card bg-white/10 backdrop-blur-sm border-white/20 p-4 rounded-xl min-w-[160px]">
              <div className="flex items-center gap-2 text-primary-foreground/80 text-sm mb-2">
                <TrendingUp className="h-4 w-4" />
                <span>{t("dashboard.welcome.totalItems")}</span>
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
            { label: t("dashboard.welcome.notes"), value: stats.notesCount.toString(), change: stats.notesCount === 0 ? t("dashboard.welcome.noneYet") : t("dashboard.welcome.created") },
            { label: t("dashboard.welcome.flashcards"), value: stats.flashcardsCount.toString(), change: stats.flashcardsCount === 0 ? t("dashboard.welcome.noneYet") : t("dashboard.welcome.created") },
            { label: t("dashboard.welcome.pastPapers"), value: stats.papersCount.toString(), change: stats.papersCount === 0 ? t("dashboard.welcome.noneYet") : t("dashboard.welcome.added") },
            { label: t("dashboard.welcome.studyStreak"), value: stats.streak > 0 ? t("dashboard.welcome.days", { count: stats.streak }) : t("dashboard.welcome.days", { count: 0 }), change: stats.streak > 0 ? t("dashboard.welcome.keepGoing") : t("dashboard.welcome.startStudying") },
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
