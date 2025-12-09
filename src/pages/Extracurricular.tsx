import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Award,
  Clock,
  Calendar,
  Trophy,
  Upload,
  Briefcase,
  Heart,
  Users,
  Music,
  Code,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  title: string;
  category: "work" | "volunteer" | "club" | "sports" | "arts" | "leadership" | "academic";
  organization: string;
  role: string;
  hours: number;
  targetHours: number;
  startDate: string;
  endDate?: string;
  achievements: string[];
  certificates: number;
  description: string;
}

const mockActivities: Activity[] = [
  {
    id: "1",
    title: "Software Development Intern",
    category: "work",
    organization: "Tech Startup Inc.",
    role: "Junior Developer",
    hours: 120,
    targetHours: 150,
    startDate: "Jun 2024",
    endDate: "Aug 2024",
    achievements: ["Built customer dashboard", "Fixed 25+ bugs"],
    certificates: 1,
    description: "Worked on frontend development using React and TypeScript.",
  },
  {
    id: "2",
    title: "Hospital Volunteer",
    category: "volunteer",
    organization: "City General Hospital",
    role: "Patient Support",
    hours: 45,
    targetHours: 50,
    startDate: "Sep 2024",
    achievements: ["Received volunteer appreciation award"],
    certificates: 1,
    description: "Assisted patients and helped with administrative tasks.",
  },
  {
    id: "3",
    title: "Debate Club",
    category: "club",
    organization: "School Debate Society",
    role: "Vice President",
    hours: 80,
    targetHours: 100,
    startDate: "Sep 2023",
    achievements: ["Regional finalist", "Best speaker award"],
    certificates: 2,
    description: "Organize weekly debates and mentor junior members.",
  },
  {
    id: "4",
    title: "Coding Bootcamp Mentor",
    category: "academic",
    organization: "Code Academy",
    role: "Student Mentor",
    hours: 30,
    targetHours: 40,
    startDate: "Oct 2024",
    achievements: ["Mentored 5 students"],
    certificates: 0,
    description: "Help beginners learn programming fundamentals.",
  },
];

const categoryConfig = {
  work: { icon: Briefcase, color: "primary", label: "Work Experience" },
  volunteer: { icon: Heart, color: "secondary", label: "Volunteering" },
  club: { icon: Users, color: "accent", label: "Clubs & Societies" },
  sports: { icon: Trophy, color: "primary", label: "Sports" },
  arts: { icon: Music, color: "premium", label: "Arts & Music" },
  leadership: { icon: Award, color: "accent", label: "Leadership" },
  academic: { icon: Code, color: "secondary", label: "Academic" },
};

export default function Extracurricular() {
  const [activities] = useState<Activity[]>(mockActivities);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const totalHours = activities.reduce((acc, a) => acc + a.hours, 0);
  const totalCertificates = activities.reduce((acc, a) => acc + a.certificates, 0);
  const totalAchievements = activities.reduce((acc, a) => acc + a.achievements.length, 0);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Extracurricular Tracker</h1>
            <p className="text-muted-foreground mt-1">Track your activities, hours, and achievements</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Activity</DialogTitle>
                <DialogDescription>Track a new extracurricular activity or work experience.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Activity Title</Label>
                  <Input id="title" placeholder="e.g., Volunteer at Local Library" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input id="organization" placeholder="Organization name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Your Role</Label>
                    <Input id="role" placeholder="e.g., Volunteer" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe your responsibilities..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="hours">Hours Logged</Label>
                    <Input id="hours" type="number" placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="target">Target Hours</Label>
                    <Input id="target" type="number" placeholder="50" />
                  </div>
                </div>
                <Button className="w-full mt-2">Add Activity</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          {[
            { label: "Total Hours", value: totalHours, icon: Clock, color: "primary" },
            { label: "Activities", value: activities.length, icon: Calendar, color: "secondary" },
            { label: "Achievements", value: totalAchievements, icon: Trophy, color: "accent" },
            { label: "Certificates", value: totalCertificates, icon: Award, color: "premium" },
          ].map((stat, index) => (
            <div key={stat.label} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  stat.color === "primary" && "bg-primary/10",
                  stat.color === "secondary" && "bg-secondary/10",
                  stat.color === "accent" && "bg-accent/20",
                  stat.color === "premium" && "bg-premium/10"
                )}>
                  <stat.icon className={cn(
                    "h-5 w-5",
                    stat.color === "primary" && "text-primary",
                    stat.color === "secondary" && "text-secondary",
                    stat.color === "accent" && "text-accent-foreground",
                    stat.color === "premium" && "text-premium"
                  )} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            <div className="glass-card p-6">
              <h3 className="font-semibold text-foreground mb-6">Activity Timeline</h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-6">
                  {activities.map((activity, index) => {
                    const config = categoryConfig[activity.category];
                    const Icon = config.icon;
                    const progress = (activity.hours / activity.targetHours) * 100;

                    return (
                      <div
                        key={activity.id}
                        className="relative pl-12 cursor-pointer group"
                        onClick={() => setSelectedActivity(activity)}
                      >
                        {/* Timeline dot */}
                        <div className={cn(
                          "absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-background transition-transform group-hover:scale-110",
                          config.color === "primary" && "bg-primary",
                          config.color === "secondary" && "bg-secondary",
                          config.color === "accent" && "bg-accent",
                          config.color === "premium" && "bg-premium"
                        )}>
                          <Icon className="h-4 w-4 text-primary-foreground" />
                        </div>

                        <div className={cn(
                          "p-4 rounded-xl transition-all duration-200",
                          selectedActivity?.id === activity.id
                            ? "bg-primary/5 border border-primary/20"
                            : "bg-muted/50 hover:bg-muted"
                        )}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                  "text-xs font-medium px-2 py-0.5 rounded-full",
                                  config.color === "primary" && "bg-primary/10 text-primary",
                                  config.color === "secondary" && "bg-secondary/10 text-secondary",
                                  config.color === "accent" && "bg-accent/20 text-accent-foreground",
                                  config.color === "premium" && "bg-premium/10 text-premium"
                                )}>
                                  {config.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {activity.startDate} {activity.endDate && `- ${activity.endDate}`}
                                </span>
                              </div>
                              <h4 className="font-semibold text-foreground">{activity.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {activity.role} at {activity.organization}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">
                                {activity.hours} / {activity.targetHours} hours
                              </span>
                              <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                          </div>

                          {activity.achievements.length > 0 && (
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
          </div>

          {/* Activity Detail / Upload Section */}
          <div className="lg:col-span-1 space-y-6 animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
            {selectedActivity ? (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-4">Activity Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium text-foreground">{selectedActivity.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Organization</p>
                    <p className="font-medium text-foreground">{selectedActivity.organization}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium text-foreground">{selectedActivity.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-foreground">{selectedActivity.description}</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">Certificates Uploaded</p>
                      <span className="text-primary font-bold">{selectedActivity.certificates}</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Certificate
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 text-center">
                <Award className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Select an activity</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any activity to view details and upload certificates
                </p>
              </div>
            )}

            {/* Quick Add Hours */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Log Hours</h3>
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="quick-activity">Activity</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    {activities.map((a) => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quick-hours">Hours</Label>
                  <Input id="quick-hours" type="number" placeholder="2" />
                </div>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Hours
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
