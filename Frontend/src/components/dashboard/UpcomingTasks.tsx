import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { AlertCircle, Calendar, ChevronRight, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const priorityStyles = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-accent/20 text-accent-foreground border-accent/30",
  low: "bg-secondary/10 text-secondary border-secondary/20",
};

interface Task {
  id: string;
  title: string;
  subject: string;
  due_date: string;
  priority: string;
  completed: boolean;
}

export function UpcomingTasks() {
  const { supabase, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [open, setOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", false)
        .order("due_date", { ascending: true })
        .limit(5);

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, supabase]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title) {
      toast.error("Please enter a task title");
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .insert([
          {
            user_id: user.id,
            title,
            subject,
            priority,
            due_date: dueDate || new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      toast.success("Task added successfully");
      setOpen(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task. Make sure the 'tasks' table exists.");
    } finally {
      setIsAdding(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSubject("");
    setPriority("medium");
    setDueDate("");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Upcoming Tasks</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary gap-1.5">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Complete Biology Revision"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Biology"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isAdding}>
                  {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Task
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming tasks</p>
            <p className="text-xs text-muted-foreground mt-1">Tasks will appear here when you add them</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
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
                <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {task.subject && `${task.subject} • `}{formatDate(task.due_date)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
