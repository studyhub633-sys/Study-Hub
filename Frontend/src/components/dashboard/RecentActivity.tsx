import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Award, BookOpen, Clock, FileText, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Activity {
  icon: typeof BookOpen;
  title: string;
  time: string;
  type: string;
  color: string;
  bgColor: string;
}

export function RecentActivity() {
  const { supabase, user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t("dashboard.activity.justNow");
    if (diffInSeconds < 3600) return t("dashboard.activity.minutesAgo", { count: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t("dashboard.activity.hoursAgo", { count: Math.floor(diffInSeconds / 3600) });
    if (diffInSeconds < 604800) return t("dashboard.activity.daysAgo", { count: Math.floor(diffInSeconds / 86400) });
    return date.toLocaleDateString();
  }

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      try {
        interface ActivityWithDate extends Activity {
          date: Date;
        }

        const allActivities: ActivityWithDate[] = [];

        // Fetch recent notes
        const { data: notes } = await supabase
          .from("notes")
          .select("id, title, updated_at, subject")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(5);

        if (notes) {
          notes.forEach((note) => {
            allActivities.push({
              icon: BookOpen,
              title: note.subject ? `${note.subject}: ${note.title}` : note.title,
              time: formatTimeAgo(new Date(note.updated_at)),
              date: new Date(note.updated_at),
              type: "note",
              color: "text-accent-foreground",
              bgColor: "bg-accent/20",
            });
          });
        }

        // Fetch recent flashcards
        const { data: flashcards } = await supabase
          .from("flashcards")
          .select("id, front, updated_at, subject")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(5);

        if (flashcards) {
          flashcards.forEach((card) => {
            allActivities.push({
              icon: Layers,
              title: card.subject ? `${card.subject} ${t("dashboard.activity.flashcardPrefix")}${card.front.substring(0, 30)}${card.front.length > 30 ? "..." : ""}` : `${t("dashboard.activity.flashcardPrefix")}${card.front.substring(0, 30)}${card.front.length > 30 ? "..." : ""}`,
              time: formatTimeAgo(new Date(card.updated_at)),
              date: new Date(card.updated_at),
              type: "flashcard",
              color: "text-primary",
              bgColor: "bg-primary/10",
            });
          });
        }

        // Fetch recent past papers
        const { data: papers } = await supabase
          .from("past_papers")
          .select("id, title, updated_at, subject")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(5);

        if (papers) {
          papers.forEach((paper) => {
            allActivities.push({
              icon: FileText,
              title: paper.subject ? `${paper.subject} ${t("dashboard.activity.pastPaperPrefix")}${paper.title}` : paper.title,
              time: formatTimeAgo(new Date(paper.updated_at)),
              date: new Date(paper.updated_at),
              type: "paper",
              color: "text-secondary",
              bgColor: "bg-secondary/10",
            });
          });
        }

        // Fetch recent extracurriculars
        const { data: extracurriculars } = await supabase
          .from("extracurriculars")
          .select("id, name, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(5);

        if (extracurriculars) {
          extracurriculars.forEach((extra) => {
            allActivities.push({
              icon: Award,
              title: `${t("dashboard.activity.loggedPrefix")}${extra.name}`,
              time: formatTimeAgo(new Date(extra.updated_at)),
              date: new Date(extra.updated_at),
              type: "extracurricular",
              color: "text-premium",
              bgColor: "bg-premium/10",
            });
          });
        }

        // Sort by date (most recent first) and take most recent 4
        allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

        // Remove the date property before setting state
        const activitiesWithoutDate = allActivities.slice(0, 4).map(({ date, ...rest }) => rest);
        setActivities(activitiesWithoutDate);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, supabase, t]);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{t("dashboard.activity.title")}</h3>
        <button
          onClick={() => {
            const { toast } = require("@/hooks/use-toast");
            toast({
              title: t("dashboard.activity.comingSoonTitle"),
              description: t("dashboard.activity.comingSoonDesc"),
            });
          }}
          className="text-sm text-primary hover:underline hover:opacity-80 transition-opacity"
        >
          {t("dashboard.activity.viewAll")}
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.activity.loading")}</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.activity.noActivity")}</p>
        ) : (
          activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
            >
              <div className={cn("p-2 rounded-lg flex-shrink-0", activity.bgColor)}>
                <activity.icon className={cn("h-4 w-4", activity.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
