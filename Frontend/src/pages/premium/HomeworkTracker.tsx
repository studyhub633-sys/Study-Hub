import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Edit,
  Loader2,
  Plus,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Homework {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  due_date: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  notification_enabled: boolean;
  created_at: string;
}

export default function HomeworkTracker() {
  const { supabase, user } = useAuth();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    due_date: "",
    priority: "medium" as "low" | "medium" | "high",
    notification_enabled: true,
  });

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      fetchHomework();
      setupNotificationCheck();
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user || !supabase) return;
    try {
      const premium = await hasPremium(supabase);
      setIsPremium(premium);
      if (!premium) {
        toast.error("This is a premium feature. Please upgrade to access.");
        navigate("/premium-dashboard");
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
    } finally {
      setCheckingPremium(false);
    }
  };

  const fetchHomework = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("homework")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setHomework(data || []);
    } catch (error: any) {
      console.error("Error fetching homework:", error);
      toast.error("Failed to load homework. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setupNotificationCheck = () => {
    // Check for due homework every minute
    const interval = setInterval(() => {
      checkDueHomework();
    }, 60000); // Check every minute

    // Also check immediately
    checkDueHomework();

    return () => clearInterval(interval);
  };

  const checkDueHomework = async () => {
    if (!user || !homework.length) return;

    const now = new Date();
    const upcoming = homework.filter((hw) => {
      if (hw.completed || !hw.notification_enabled) return false;
      const dueDate = new Date(hw.due_date);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      // Notify if due within 24 hours and not already notified today
      return hoursUntilDue <= 24 && hoursUntilDue > 0;
    });

    upcoming.forEach((hw) => {
      const dueDate = new Date(hw.due_date);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilDue <= 1 && hoursUntilDue > 0) {
        toast.warning(`⏰ "${hw.title}" is due in less than 1 hour!`, {
          duration: 10000,
        });
      } else if (hoursUntilDue <= 24) {
        toast.info(`📚 "${hw.title}" is due in ${Math.round(hoursUntilDue)} hours`, {
          duration: 5000,
        });
      }
    });
  };

  const handleCreateHomework = () => {
    setEditingHomework(null);
    setFormData({
      title: "",
      description: "",
      subject: "",
      due_date: "",
      priority: "medium",
      notification_enabled: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditHomework = (hw: Homework) => {
    setEditingHomework(hw);
    setFormData({
      title: hw.title,
      description: hw.description || "",
      subject: hw.subject || "",
      due_date: hw.due_date ? new Date(hw.due_date).toISOString().slice(0, 16) : "",
      priority: hw.priority,
      notification_enabled: hw.notification_enabled,
    });
    setIsDialogOpen(true);
  };

  const handleSaveHomework = async () => {
    if (!user || !formData.title || !formData.due_date) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      if (editingHomework) {
        const { error } = await supabase
          .from("homework")
          .update({
            title: formData.title,
            description: formData.description || null,
            subject: formData.subject || null,
            due_date: formData.due_date,
            priority: formData.priority,
            notification_enabled: formData.notification_enabled,
          })
          .eq("id", editingHomework.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("Homework updated successfully");
      } else {
        const { error } = await supabase.from("homework").insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          subject: formData.subject || null,
          due_date: formData.due_date,
          priority: formData.priority,
          notification_enabled: formData.notification_enabled,
          completed: false,
        });

        if (error) throw error;
        toast.success("Homework added successfully");
      }

      setIsDialogOpen(false);
      fetchHomework();
    } catch (error: any) {
      console.error("Error saving homework:", error);
      toast.error(error.message || "Failed to save homework. Please try again.");
    }
  };

  const handleToggleComplete = async (hw: Homework) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("homework")
        .update({ completed: !hw.completed })
        .eq("id", hw.id)
        .eq("user_id", user.id);

      if (error) throw error;
      fetchHomework();
    } catch (error: any) {
      console.error("Error updating homework:", error);
      toast.error("Failed to update homework.");
    }
  };

  const handleDeleteHomework = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this homework?")) return;

    try {
      const { error } = await supabase
        .from("homework")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Homework deleted successfully");
      fetchHomework();
    } catch (error: any) {
      console.error("Error deleting homework:", error);
      toast.error("Failed to delete homework.");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (checkingPremium) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!isPremium) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-[60vh] gap-4">
          <Crown className="h-16 w-16 text-premium" />
          <h2 className="text-2xl font-bold">Premium Feature</h2>
          <p className="text-muted-foreground">This feature is available for premium members only.</p>
          <Button onClick={() => navigate("/premium-dashboard")}>Upgrade to Premium</Button>
        </div>
      </AppLayout>
    );
  }

  const upcoming = homework.filter((hw) => !hw.completed);
  const completed = homework.filter((hw) => hw.completed);
  const overdue = upcoming.filter((hw) => getDaysUntilDue(hw.due_date) < 0);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Homework Tracker</h1>
            <p className="text-muted-foreground mt-1">
              Track your assignments and get notified when they're due
            </p>
          </div>
          <Button onClick={handleCreateHomework}>
            <Plus className="h-4 w-4 mr-2" />
            Add Homework
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {overdue.length > 0 && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Overdue ({overdue.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {overdue.map((hw) => (
                    <HomeworkCard
                      key={hw.id}
                      homework={hw}
                      onEdit={handleEditHomework}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteHomework}
                      getPriorityColor={getPriorityColor}
                      getDaysUntilDue={getDaysUntilDue}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Upcoming ({upcoming.length - overdue.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcoming.filter((hw) => getDaysUntilDue(hw.due_date) >= 0).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No upcoming homework</p>
                ) : (
                  upcoming
                    .filter((hw) => getDaysUntilDue(hw.due_date) >= 0)
                    .map((hw) => (
                      <HomeworkCard
                        key={hw.id}
                        homework={hw}
                        onEdit={handleEditHomework}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteHomework}
                        getPriorityColor={getPriorityColor}
                        getDaysUntilDue={getDaysUntilDue}
                      />
                    ))
                )}
              </CardContent>
            </Card>

            {completed.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Completed ({completed.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {completed.map((hw) => (
                    <HomeworkCard
                      key={hw.id}
                      homework={hw}
                      onEdit={handleEditHomework}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteHomework}
                      getPriorityColor={getPriorityColor}
                      getDaysUntilDue={getDaysUntilDue}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {homework.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No homework yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first assignment to get started</p>
                  <Button onClick={handleCreateHomework}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Homework
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHomework ? "Edit Homework" : "Add Homework"}</DialogTitle>
              <DialogDescription>
                Track your assignments and get notified when they're due
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Biology Essay on Cells"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Biology"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date & Time *</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notification_enabled"
                  checked={formData.notification_enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, notification_enabled: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="notification_enabled" className="cursor-pointer">
                  Enable notifications for this homework
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveHomework}>
                {editingHomework ? "Update" : "Add"} Homework
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

function HomeworkCard({
  homework,
  onEdit,
  onToggleComplete,
  onDelete,
  getPriorityColor,
  getDaysUntilDue,
}: {
  homework: Homework;
  onEdit: (hw: Homework) => void;
  onToggleComplete: (hw: Homework) => void;
  onDelete: (id: string) => void;
  getPriorityColor: (priority: string) => string;
  getDaysUntilDue: (dueDate: string) => number;
}) {
  const daysUntil = getDaysUntilDue(homework.due_date);
  const isOverdue = daysUntil < 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border transition-all",
        homework.completed
          ? "bg-muted/50 opacity-75"
          : isOverdue
            ? "bg-destructive/5 border-destructive/20"
            : "bg-card hover:bg-muted/50"
      )}
    >
      <div className="flex items-start gap-3 flex-1">
        <button
          onClick={() => onToggleComplete(homework)}
          className="mt-1 flex-shrink-0"
        >
          {homework.completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                "font-semibold",
                homework.completed && "line-through text-muted-foreground"
              )}
            >
              {homework.title}
            </h3>
            <Badge className={cn("text-xs", getPriorityColor(homework.priority))}>
              {homework.priority}
            </Badge>
            {homework.notification_enabled && (
              <Bell className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {homework.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {homework.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {homework.subject && (
              <span className="px-2 py-0.5 rounded bg-muted">{homework.subject}</span>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {isOverdue
                  ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""}`
                  : daysUntil === 0
                    ? "Due today"
                    : daysUntil === 1
                      ? "Due tomorrow"
                      : `Due in ${daysUntil} days`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(homework.due_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(homework)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(homework.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

