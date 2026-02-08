import { useAuth } from "@/contexts/AuthContext";
import { hasPremium } from "@/lib/premium";
import { Brain, Sparkles } from "lucide-react";
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

        // Fetch counts and activity for streak from ALL study sources
        const [
          notesResult,
          flashcardsResult,
          papersResult,
          // Activity dates from ALL sources for comprehensive streak tracking
          notesDates,
          flashcardsDates,
          aiUsageDates,
          aiChatSessionsDates,
          knowledgeOrganizersDates,
          pastPapersDates,
          homeworkDates,
          tasksDates,
          mindMapsDates,
          examSubmissionsDates,
          studySessionsDates,
          extracurricularsDates,
        ] = await Promise.all([
          // Counts for display
          supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("flashcards").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("past_papers").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          // Activity dates for streak calculation - ALL sources
          supabase.from("notes").select("created_at, updated_at").eq("user_id", user.id),
          supabase.from("flashcards").select("created_at, updated_at, last_reviewed").eq("user_id", user.id),
          supabase.from("ai_usage_tracking").select("created_at").eq("user_id", user.id),
          supabase.from("ai_chat_sessions").select("created_at, updated_at").eq("user_id", user.id),
          supabase.from("knowledge_organizers").select("created_at, updated_at").eq("user_id", user.id),
          supabase.from("past_papers").select("created_at, updated_at, completed_at").eq("user_id", user.id),
          supabase.from("homework").select("created_at, updated_at").eq("user_id", user.id),
          supabase.from("tasks").select("created_at, updated_at").eq("user_id", user.id),
          supabase.from("mind_maps").select("created_at, updated_at").eq("user_id", user.id),
          supabase.from("exam_submissions").select("created_at, submission_date").eq("user_id", user.id),
          supabase.from("study_sessions").select("date, created_at").eq("user_id", user.id),
          supabase.from("extracurriculars").select("created_at, updated_at").eq("user_id", user.id),
        ]);

        // Convert date to YYYY-MM-DD format
        const toYMD = (d: Date) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        // Collect ALL activity dates into a Set
        const dates = new Set<string>();

        // Helper to safely add dates
        const addDates = (data: any[] | null, fields: string[]) => {
          (data || []).forEach((r: any) => {
            fields.forEach(field => {
              if (r[field]) {
                try {
                  dates.add(toYMD(new Date(r[field])));
                } catch (e) { /* ignore invalid dates */ }
              }
            });
          });
        };

        // Add dates from all sources
        addDates(notesDates.data, ["created_at", "updated_at"]);
        addDates(flashcardsDates.data, ["created_at", "updated_at", "last_reviewed"]);
        addDates(aiUsageDates.data, ["created_at"]);
        addDates(aiChatSessionsDates.data, ["created_at", "updated_at"]);
        addDates(knowledgeOrganizersDates.data, ["created_at", "updated_at"]);
        addDates(pastPapersDates.data, ["created_at", "updated_at", "completed_at"]);
        addDates(homeworkDates.data, ["created_at", "updated_at"]);
        addDates(tasksDates.data, ["created_at", "updated_at"]);
        addDates(mindMapsDates.data, ["created_at", "updated_at"]);
        addDates(examSubmissionsDates.data, ["created_at", "submission_date"]);
        addDates(studySessionsDates.data, ["date", "created_at"]);
        addDates(extracurricularsDates.data, ["created_at", "updated_at"]);

        // Calculate streak: count consecutive days from today/yesterday backwards
        const streak = (() => {
          if (dates.size === 0) return 0;

          const today = toYMD(new Date());
          const yesterday = toYMD(new Date(Date.now() - 86400000)); // 24 hours ago

          // Start from today or yesterday (to allow for timezone differences)
          let ref: string;
          if (dates.has(today)) {
            ref = today;
          } else if (dates.has(yesterday)) {
            ref = yesterday;
          } else {
            return 0; // No recent activity, streak is broken
          }

          // Count consecutive days backwards
          let count = 0;
          let currentDate = ref;

          while (dates.has(currentDate)) {
            count++;
            // Move to previous day
            const [y, m, day] = currentDate.split("-").map(Number);
            const prevDate = new Date(y, m - 1, day - 1);
            currentDate = toYMD(prevDate);
          }

          return count;
        })();

        setStats({
          notesCount: notesResult.count || 0,
          flashcardsCount: flashcardsResult.count || 0,
          papersCount: papersResult.count || 0,
          streak,
        });

        // Fetch AI usage for display
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


        </div>

        {/* Study Streak */}
        <div className="mt-6">
          <div
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 animate-scale-in inline-block min-w-[140px]"
          >
            <p className="text-primary-foreground/70 text-xs mb-1">{t("dashboard.welcome.studyStreak")}</p>
            <p className="text-primary-foreground font-bold text-lg">
              {stats.streak > 0 ? t("dashboard.welcome.days", { count: stats.streak }) : t("dashboard.welcome.days", { count: 0 })}
            </p>
            <p className="text-primary-foreground/60 text-xs mt-0.5">
              {stats.streak > 0 ? t("dashboard.welcome.keepGoing") : t("dashboard.welcome.startStudying")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
