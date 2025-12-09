import { BookOpen, Layers, FileText, Award, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    icon: Layers,
    title: "Completed Biology Flashcards",
    time: "2 hours ago",
    type: "flashcard",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: FileText,
    title: "Started Chemistry Past Paper",
    time: "4 hours ago",
    type: "paper",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: BookOpen,
    title: "Added notes for Physics Chapter 5",
    time: "Yesterday",
    type: "note",
    color: "text-accent-foreground",
    bgColor: "bg-accent/20",
  },
  {
    icon: Award,
    title: "Logged 3 hours volunteering",
    time: "2 days ago",
    type: "extracurricular",
    color: "text-premium",
    bgColor: "bg-premium/10",
  },
];

export function RecentActivity() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
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
        ))}
      </div>
    </div>
  );
}
