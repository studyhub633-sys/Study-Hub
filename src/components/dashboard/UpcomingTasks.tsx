import { Calendar, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const tasks = [
  {
    title: "Chemistry Mock Exam",
    subject: "Chemistry",
    dueDate: "Tomorrow",
    priority: "high",
  },
  {
    title: "Physics Chapter 6 Notes",
    subject: "Physics",
    dueDate: "In 2 days",
    priority: "medium",
  },
  {
    title: "Biology Flashcard Review",
    subject: "Biology",
    dueDate: "In 3 days",
    priority: "low",
  },
];

const priorityStyles = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-accent/20 text-accent-foreground border-accent/30",
  low: "bg-secondary/10 text-secondary border-secondary/20",
};

export function UpcomingTasks() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Upcoming Tasks</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          Add Task
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
          >
            <div className={cn(
              "p-2 rounded-lg border",
              priorityStyles[task.priority as keyof typeof priorityStyles]
            )}>
              {task.priority === "high" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.subject} • {task.dueDate}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
