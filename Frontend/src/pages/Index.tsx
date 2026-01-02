import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SuggestedResources } from "@/components/dashboard/SuggestedResources";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Award, BookOpen, Brain, FileText, Layers, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const modules = [
  {
    icon: BookOpen,
    title: "Exam Notes",
    description: "Organized notes by subject and topic with highlights",
    countLabel: "notes",
    path: "/notes",
    color: "primary" as const,
    tableName: "notes",
  },
  {
    icon: Layers,
    title: "Flashcards",
    description: "Interactive cards with quiz mode and progress tracking",
    countLabel: "cards",
    path: "/flashcards",
    color: "secondary" as const,
    tableName: "flashcards",
  },
  {
    icon: FileText,
    title: "Past Papers",
    description: "Practice with marked answers and timed quizzes",
    countLabel: "papers",
    path: "/past-papers",
    color: "accent" as const,
    tableName: "past_papers",
  },
  {
    icon: Brain,
    title: "Knowledge Organizers",
    description: "Visual summaries with collapsible sections",
    countLabel: "organizers",
    path: "/knowledge",
    color: "primary" as const,
    tableName: "knowledge_organizers",
  },
  {
    icon: Award,
    title: "Extracurriculars",
    description: "Track activities, hours, and achievements",
    countLabel: "activities",
    path: "/extracurricular",
    color: "premium" as const,
    tableName: "extracurriculars",
  },
  {
    icon: Sparkles,
    title: "AI Question Bank",
    description: "AI-generated questions tailored to your subjects",
    count: 500,
    countLabel: "questions",
    path: "/premium",
    color: "premium" as const,
    isPremium: true,
  },
];

export default function Dashboard() {
  const { supabase, user } = useAuth();
  const [moduleCounts, setModuleCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        const counts: Record<string, number> = {};

        // Fetch counts for each module that has a table
        for (const module of modules) {
          if (module.tableName && !module.isPremium) {
            const { count, error } = await supabase
              .from(module.tableName)
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id);

            if (!error) {
              counts[module.tableName] = count || 0;
            }
          }
        }

        setModuleCounts(counts);
      } catch (error) {
        console.error("Error fetching module counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [user, supabase]);

  const modulesWithCounts = modules.map((module) => {
    if (module.isPremium) {
      return module;
    }
    const count = module.tableName ? (moduleCounts[module.tableName] || 0) : 0;
    return {
      ...module,
      count,
      progress: undefined, // Remove hardcoded progress
    };
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <section className="animate-fade-in">
          <WelcomeCard />
        </section>

        {/* Quick Access Modules */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Quick Access</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modulesWithCounts.map((module, index) => (
              <div
                key={module.title}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
              >
                <ModuleCard {...module} />
              </div>
            ))}
          </div>
        </section>

        {/* Activity & Tasks Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            <RecentActivity />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
            <UpcomingTasks />
          </div>
        </section>

        {/* Suggestions */}
        <section className="animate-slide-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
          <SuggestedResources />
        </section>
      </div>
    </AppLayout>
  );
}
