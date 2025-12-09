import { BookOpen, Layers, FileText, Brain, Award, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { SuggestedResources } from "@/components/dashboard/SuggestedResources";

const modules = [
  {
    icon: BookOpen,
    title: "Exam Notes",
    description: "Organized notes by subject and topic with highlights",
    count: 48,
    countLabel: "notes",
    path: "/notes",
    color: "primary" as const,
    progress: 65,
  },
  {
    icon: Layers,
    title: "Flashcards",
    description: "Interactive cards with quiz mode and progress tracking",
    count: 256,
    countLabel: "cards",
    path: "/flashcards",
    color: "secondary" as const,
    progress: 73,
  },
  {
    icon: FileText,
    title: "Past Papers",
    description: "Practice with marked answers and timed quizzes",
    count: 32,
    countLabel: "papers",
    path: "/past-papers",
    color: "accent" as const,
    progress: 40,
  },
  {
    icon: Brain,
    title: "Knowledge Organizers",
    description: "Visual summaries with collapsible sections",
    count: 18,
    countLabel: "organizers",
    path: "/knowledge",
    color: "primary" as const,
    progress: 55,
  },
  {
    icon: Award,
    title: "Extracurriculars",
    description: "Track activities, hours, and achievements",
    count: 12,
    countLabel: "activities",
    path: "/extracurricular",
    color: "premium" as const,
    progress: 80,
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
            <button className="text-sm text-primary hover:underline">Customize</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module, index) => (
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
