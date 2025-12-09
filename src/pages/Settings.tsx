import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Palette,
  Shield,
  CreditCard,
  Crown,
  Camera,
  Mail,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsSections = [
  { icon: User, label: "Profile", id: "profile" },
  { icon: Bell, label: "Notifications", id: "notifications" },
  { icon: Palette, label: "Appearance", id: "appearance" },
  { icon: Shield, label: "Privacy", id: "privacy" },
  { icon: CreditCard, label: "Subscription", id: "subscription" },
];

export default function Settings() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Navigation */}
          <div className="md:col-span-1">
            <nav className="space-y-1 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    section.id === "profile"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3 space-y-6">
            {/* Profile Section */}
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
              <h2 className="text-lg font-semibold text-foreground mb-6">Profile Information</h2>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=student" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Jamie Student</h3>
                  <p className="text-sm text-muted-foreground">jamie.student@email.com</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Free Plan</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Jamie" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Student" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" defaultValue="jamie.student@email.com" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school">School / Institution</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="school" defaultValue="Greenfield Academy" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year Group</Label>
                  <Select defaultValue="12">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Year 10</SelectItem>
                      <SelectItem value="11">Year 11</SelectItem>
                      <SelectItem value="12">Year 12</SelectItem>
                      <SelectItem value="13">Year 13</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects (comma separated)</Label>
                  <Input id="subjects" defaultValue="Biology, Chemistry, Physics, Maths" />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button>Save Changes</Button>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
              <h2 className="text-lg font-semibold text-foreground mb-6">Notifications</h2>
              
              <div className="space-y-4">
                {[
                  { label: "Study reminders", description: "Get daily reminders to study", defaultChecked: true },
                  { label: "Progress updates", description: "Weekly summary of your progress", defaultChecked: true },
                  { label: "New content alerts", description: "When new papers or notes are added", defaultChecked: false },
                  { label: "Achievement notifications", description: "Celebrate your milestones", defaultChecked: true },
                ].map((notification) => (
                  <div key={notification.label} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{notification.label}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <Switch defaultChecked={notification.defaultChecked} />
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Section */}
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
              <h2 className="text-lg font-semibold text-foreground mb-6">Subscription</h2>
              
              <div className="p-4 rounded-xl bg-muted/50 border border-border mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Free Plan</p>
                    <p className="text-sm text-muted-foreground">Basic access to study materials</p>
                  </div>
                  <Button className="bg-premium hover:bg-premium/90 text-premium-foreground">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Unlock AI-powered features, advanced analytics, and ad-free studying with Premium.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
