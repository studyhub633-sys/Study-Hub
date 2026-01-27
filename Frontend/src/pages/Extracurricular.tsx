import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Award,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Code,
  Edit,
  ExternalLink,
  Globe,
  Heart,
  Loader2,
  Music,
  Plus,
  Trash2,
  Trophy,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Activity {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  hours: number;
  start_date: string | null;
  end_date: string | null;
  achievements: string[] | null;
  external_link: string | null;
  created_at: string;
  updated_at: string;
}

const categoryConfig: Record<string, { icon: any; color: string; label: string }> = {
  work: { icon: Briefcase, color: "primary", label: "Work Experience" },
  volunteer: { icon: Heart, color: "secondary", label: "Volunteering" },
  club: { icon: Users, color: "accent", label: "Clubs & Societies" },
  sports: { icon: Trophy, color: "primary", label: "Sports" },
  arts: { icon: Music, color: "premium", label: "Arts & Music" },
  leadership: { icon: Award, color: "accent", label: "Leadership" },
  academic: { icon: Code, color: "secondary", label: "Academic" },
};

export default function Extracurricular() {
  const { supabase, user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    hours: "",
    targetHours: "",
    start_date: "",
    end_date: "",
    achievements: "",
    external_link: "",
  });

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("extracurriculars")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Error",
        description: "Failed to load activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = () => {
    setEditingActivity(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      hours: "",
      targetHours: "",
      start_date: "",
      end_date: "",
      achievements: "",
      external_link: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description || "",
      category: activity.category || "",
      hours: activity.hours.toString(),
      targetHours: "", // Not stored in DB, but can be calculated
      start_date: activity.start_date || "",
      end_date: activity.end_date || "",
      achievements: activity.achievements?.join(", ") || "",
      external_link: activity.external_link || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveActivity = async () => {
    if (!user || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Activity name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const achievementsArray = formData.achievements
        ? formData.achievements.split(",").map((a) => a.trim()).filter(Boolean)
        : [];

      const updateData: any = {
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        category: formData.category || null,
        hours: parseInt(formData.hours) || 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        achievements: achievementsArray.length > 0 ? achievementsArray : null,
        external_link: formData.external_link?.trim() || null,
      };

      if (editingActivity) {
        const { error } = await supabase
          .from("extracurriculars")
          .update(updateData)
          .eq("id", editingActivity.id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Activity updated successfully",
        });
      } else {
        const { error } = await supabase.from("extracurriculars").insert(updateData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Activity created successfully",
        });
      }

      setIsAddDialogOpen(false);
      fetchActivities();
    } catch (error: any) {
      console.error("Error saving activity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this activity?")) return;

    try {
      const { error } = await supabase
        .from("extracurriculars")
        .delete()
        .eq("id", activityId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });

      if (selectedActivity?.id === activityId) {
        setSelectedActivity(null);
      }

      fetchActivities();
    } catch (error: any) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error",
        description: "Failed to delete activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogHours = async (activityId: string, hours: number) => {
    if (!user || !hours || hours <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of hours",
        variant: "destructive",
      });
      return;
    }

    try {
      const activity = activities.find((a) => a.id === activityId);
      if (!activity) return;

      const { error } = await supabase
        .from("extracurriculars")
        .update({ hours: activity.hours + hours })
        .eq("id", activityId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${hours} hours logged successfully`,
      });

      fetchActivities();
    } catch (error: any) {
      console.error("Error logging hours:", error);
      toast({
        title: "Error",
        description: "Failed to log hours. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalHours = activities.reduce((acc, a) => acc + a.hours, 0);
  const totalAchievements = activities.reduce(
    (acc, a) => acc + (a.achievements?.length || 0),
    0
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("extracurricular.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("extracurricular.subtitle")}</p>
          </div>
          <Button onClick={handleCreateActivity}>
            <Plus className="h-4 w-4 mr-2" />
            {t("extracurricular.addActivity")}
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {[
            { label: t("extracurricular.totalHours"), value: totalHours, icon: Clock, color: "primary" },
            { label: t("extracurricular.activities"), value: activities.length, icon: Calendar, color: "secondary" },
            { label: t("extracurricular.achievements"), value: totalAchievements, icon: Trophy, color: "accent" },
            { label: t("extracurricular.active"), value: activities.filter((a) => !a.end_date).length, icon: Award, color: "premium" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    stat.color === "primary" && "bg-primary/10",
                    stat.color === "secondary" && "bg-secondary/10",
                    stat.color === "accent" && "bg-accent/20",
                    stat.color === "premium" && "bg-premium/10"
                  )}
                >
                  <stat.icon
                    className={cn(
                      "h-5 w-5",
                      stat.color === "primary" && "text-primary",
                      stat.color === "secondary" && "text-secondary",
                      stat.color === "accent" && "text-accent-foreground",
                      stat.color === "premium" && "text-premium"
                    )}
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* External Opportunities Section */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t("extracurricular.findOpportunities")}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t("extracurricular.findOppDesc")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                name: "Do-it",
                url: "https://doit.life/volunteer",
                desc: "Find volunteering opportunities near you",
                category: "Volunteering"
              },
              {
                name: "vInspired",
                url: "https://vinspired.com",
                desc: "Youth volunteering and social action",
                category: "Volunteering"
              },
              {
                name: "Springpod",
                url: "https://www.springpod.com",
                desc: "Virtual work experience programmes",
                category: "Work Experience"
              },
              {
                name: "RateMyPlacement",
                url: "https://www.ratemyplacement.co.uk",
                desc: "Student placements and internships",
                category: "Work Experience"
              },
              {
                name: "Investin",
                url: "https://investin.org",
                desc: "Career experience programmes",
                category: "Work Experience"
              },
              {
                name: "NCS",
                url: "https://wearencs.com",
                desc: "National Citizen Service programmes",
                category: "Leadership"
              },
              {
                name: "DofE",
                url: "https://www.dofe.org",
                desc: "Duke of Edinburgh Award",
                category: "Skills"
              },
              {
                name: "Young Enterprise",
                url: "https://www.young-enterprise.org.uk",
                desc: "Business and entrepreneurship skills",
                category: "Skills"
              },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-lg bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                        {link.name}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary mt-1 inline-block">
                      {link.category}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {link.desc}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Timeline and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {activities.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Award className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{t("extracurricular.noActivities")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("extracurricular.createFirst")}
                </p>
                <Button onClick={handleCreateActivity}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("extracurricular.addActivity")}
                </Button>
              </div>
            ) : (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-6">{t("extracurricular.activityTimeline")}</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                  <div className="space-y-6">
                    {activities.map((activity) => {
                      const config = categoryConfig[activity.category || ""] || {
                        icon: Award,
                        color: "primary",
                        label: activity.category || "Other",
                      };
                      const Icon = config.icon;
                      const targetHours = 100; // Default target, can be made configurable
                      const progress = Math.min((activity.hours / targetHours) * 100, 100);

                      return (
                        <div
                          key={activity.id}
                          className="relative pl-12 cursor-pointer group"
                          onClick={() => setSelectedActivity(activity)}
                        >
                          {/* Timeline dot */}
                          <div
                            className={cn(
                              "absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-background transition-transform group-hover:scale-110",
                              config.color === "primary" && "bg-primary",
                              config.color === "secondary" && "bg-secondary",
                              config.color === "accent" && "bg-accent",
                              config.color === "premium" && "bg-premium"
                            )}
                          >
                            <Icon className="h-4 w-4 text-primary-foreground" />
                          </div>

                          <div
                            className={cn(
                              "p-4 rounded-xl transition-all duration-200",
                              selectedActivity?.id === activity.id
                                ? "bg-primary/5 border border-primary/20"
                                : "bg-muted/50 hover:bg-muted"
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={cn(
                                      "text-xs font-medium px-2 py-0.5 rounded-full",
                                      config.color === "primary" && "bg-primary/10 text-primary",
                                      config.color === "secondary" && "bg-secondary/10 text-secondary",
                                      config.color === "accent" && "bg-accent/20 text-accent-foreground",
                                      config.color === "premium" && "bg-premium/10 text-premium"
                                    )}
                                  >
                                    {config.label}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(activity.start_date)}
                                    {activity.end_date && ` - ${formatDate(activity.end_date)}`}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-foreground">{activity.name}</h4>
                                {activity.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {activity.description}
                                  </p>
                                )}
                                {activity.external_link && (
                                  <a
                                    href={activity.external_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    View Link
                                  </a>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditActivity(activity);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteActivity(activity.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">
                                  {activity.hours} / {targetHours} hours
                                </span>
                                <span className="font-medium text-foreground">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <Progress value={progress} className="h-1.5" />
                            </div>

                            {activity.achievements && activity.achievements.length > 0 && (
                              <div className="flex items-center gap-2 mt-3 flex-wrap">
                                {activity.achievements.map((achievement, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground"
                                  >
                                    <Trophy className="h-3 w-3" />
                                    {achievement}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activity Detail / Log Hours */}
          <div className="lg:col-span-1 space-y-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {selectedActivity ? (
              <div className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{t("extracurricular.activityDetails")}</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditActivity(selectedActivity)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteActivity(selectedActivity.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{selectedActivity.name}</p>
                  </div>
                  {selectedActivity.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-foreground">{selectedActivity.description}</p>
                    </div>
                  )}
                  {selectedActivity.external_link && (
                    <div>
                      <p className="text-sm text-muted-foreground">External Link</p>
                      <a
                        href={selectedActivity.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {selectedActivity.external_link}
                      </a>
                    </div>
                  )}
                  {selectedActivity.category && (
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium text-foreground">
                        {categoryConfig[selectedActivity.category]?.label || selectedActivity.category}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Hours Logged</p>
                    <p className="font-medium text-foreground">{selectedActivity.hours} hours</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-2">Achievements</p>
                    {selectedActivity.achievements && selectedActivity.achievements.length > 0 ? (
                      <div className="space-y-1">
                        {selectedActivity.achievements.map((achievement, i) => (
                          <div
                            key={i}
                            className="text-sm text-foreground flex items-center gap-2"
                          >
                            <Trophy className="h-4 w-4 text-accent-foreground" />
                            {achievement}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No achievements yet</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 text-center">
                <Award className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Select an activity</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any activity to view details
                </p>
              </div>
            )}

            {/* Quick Log Hours */}
            {activities.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-4">Log Hours</h3>
                <QuickLogHours
                  activities={activities}
                  onLogHours={handleLogHours}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? "Edit Activity" : "Add New Activity"}
            </DialogTitle>
            <DialogDescription>
              {editingActivity
                ? "Update your activity details below"
                : "Track a new extracurricular activity or work experience."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Activity Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Volunteer at Local Library"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your responsibilities..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hours">Hours Logged</Label>
                <Input
                  id="hours"
                  type="number"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_date">End Date (optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="achievements">Achievements (comma-separated)</Label>
              <Input
                id="achievements"
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                placeholder="e.g., Award winner, Team leader"
              />
            </div>
            <Button className="w-full mt-2" onClick={handleSaveActivity}>
              {editingActivity ? "Update" : "Add"} Activity
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function QuickLogHours({
  activities,
  onLogHours,
}: {
  activities: Activity[];
  onLogHours: (activityId: string, hours: number) => void;
}) {
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [hours, setHours] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedActivityId && hours) {
      onLogHours(selectedActivityId, parseFloat(hours));
      setHours("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-2">
        <Label htmlFor="quick-activity">Activity</Label>
        <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
          <SelectTrigger>
            <SelectValue placeholder="Select activity" />
          </SelectTrigger>
          <SelectContent>
            {activities.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="quick-hours">Hours</Label>
        <Input
          id="quick-hours"
          type="number"
          step="0.5"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="2"
        />
      </div>
      <Button type="submit" className="w-full" disabled={!selectedActivityId || !hours}>
        <Plus className="h-4 w-4 mr-2" />
        Log Hours
      </Button>
    </form>
  );
}
