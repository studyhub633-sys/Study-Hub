import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";

const settingsSections = [
  { icon: User, label: "Profile", id: "profile" },
  { icon: Bell, label: "Notifications", id: "notifications" },
  { icon: Palette, label: "Appearance", id: "appearance" },
  { icon: Shield, label: "Privacy", id: "privacy" },
  { icon: CreditCard, label: "Subscription", id: "subscription" },
];

export default function Settings() {
  const { supabase, user } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    first_name: "",
    last_name: "",
    school: "",
    year_group: "",
    subjects: "",
    avatar_url: "",
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    studyReminders: true,
    progressUpdates: true,
    newContentAlerts: false,
    achievementNotifications: true,
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
        }

        if (profile) {
          // Split full_name into first and last name if it exists
          const nameParts = profile.full_name?.split(" ") || [];
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          setProfileData({
            full_name: profile.full_name || "",
            email: profile.email || user.email || "",
            first_name: firstName,
            last_name: lastName,
            school: (profile as any).school || "",
            year_group: (profile as any).year_group || "",
            subjects: (profile as any).subjects || "",
            avatar_url: profile.avatar_url || "",
          });
        } else {
          // Set default values from user
          setProfileData({
            full_name: user.email?.split("@")[0] || "",
            email: user.email || "",
            first_name: "",
            last_name: "",
            school: "",
            year_group: "",
            subjects: "",
            avatar_url: "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabase]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    // Convert image to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setProfileData({ ...profileData, avatar_url: base64String });
      
      // Auto-save the avatar
      if (user) {
        try {
          const { error } = await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              avatar_url: base64String,
            }, {
              onConflict: "id"
            });

          if (error) throw error;

          toast({
            title: "Avatar updated",
            description: "Your profile picture has been updated.",
          });
        } catch (error: any) {
          console.error("Error saving avatar:", error);
          toast({
            title: "Error",
            description: "Failed to save avatar. Please try again.",
            variant: "destructive",
          });
        }
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read image file.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const fullName = profileData.first_name && profileData.last_name
        ? `${profileData.first_name} ${profileData.last_name}`
        : profileData.first_name || profileData.last_name || profileData.full_name || "";

      // Build update object with only fields that exist
      const updateData: any = {
        id: user.id,
        email: profileData.email || user.email,
        full_name: fullName,
        avatar_url: profileData.avatar_url || null,
      };

      // Try to include additional fields (they may not exist in the table yet)
      // These will be ignored if the columns don't exist
      if (profileData.school) updateData.school = profileData.school;
      if (profileData.year_group) updateData.year_group = profileData.year_group;
      if (profileData.subjects) updateData.subjects = profileData.subjects;

      const { error } = await supabase
        .from("profiles")
        .upsert(updateData, {
          onConflict: "id"
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const displayName = profileData.first_name && profileData.last_name
    ? `${profileData.first_name} ${profileData.last_name}`
    : profileData.full_name || profileData.email?.split("@")[0] || "User";

  const initials = profileData.first_name && profileData.last_name
    ? `${profileData.first_name[0]}${profileData.last_name[0]}`
    : displayName.substring(0, 2).toUpperCase();

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
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeSection === section.id
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
            {loading ? (
              <div className="glass-card p-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Profile Section */}
                {activeSection === "profile" && (
                  <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
                    <h2 className="text-lg font-semibold text-foreground mb-6">Profile Information</h2>
                    
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative">
                        <Avatar className="h-20 w-20 border-4 border-primary/20">
                          <AvatarImage 
                            src={profileData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors cursor-pointer">
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{displayName}</h3>
                        <p className="text-sm text-muted-foreground">{profileData.email || user?.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Free Plan</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.first_name}
                          onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.last_name}
                          onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="school">School / Institution</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="school"
                            value={profileData.school}
                            onChange={(e) => setProfileData({ ...profileData, school: e.target.value })}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year Group</Label>
                        <Select
                          value={profileData.year_group}
                          onValueChange={(value) => setProfileData({ ...profileData, year_group: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year group" />
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
                        <Input
                          id="subjects"
                          value={profileData.subjects}
                          onChange={(e) => setProfileData({ ...profileData, subjects: e.target.value })}
                          placeholder="Biology, Chemistry, Physics, Maths"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button onClick={handleSaveProfile} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notifications Section */}
                {activeSection === "notifications" && (
                  <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
                    <h2 className="text-lg font-semibold text-foreground mb-6">Notifications</h2>
                    
                    <div className="space-y-4">
                      {[
                        { 
                          key: "studyReminders",
                          label: "Study reminders", 
                          description: "Get daily reminders to study" 
                        },
                        { 
                          key: "progressUpdates",
                          label: "Progress updates", 
                          description: "Weekly summary of your progress" 
                        },
                        { 
                          key: "newContentAlerts",
                          label: "New content alerts", 
                          description: "When new papers or notes are added" 
                        },
                        { 
                          key: "achievementNotifications",
                          label: "Achievement notifications", 
                          description: "Celebrate your milestones" 
                        },
                      ].map((notification) => (
                        <div key={notification.key} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{notification.label}</p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                          </div>
                          <Switch
                            checked={notifications[notification.key as keyof typeof notifications]}
                            onCheckedChange={(checked) =>
                              setNotifications({ ...notifications, [notification.key]: checked })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appearance Section */}
                {activeSection === "appearance" && (
                  <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
                    <h2 className="text-lg font-semibold text-foreground mb-6">Appearance</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Theme</p>
                          <p className="text-sm text-muted-foreground">
                            Choose between light and dark mode
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant={theme === "light" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("light")}
                          >
                            Light
                          </Button>
                          <Button
                            variant={theme === "dark" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("dark")}
                          >
                            Dark
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          <p className="font-medium text-foreground">Quick Toggle</p>
                          <p className="text-sm text-muted-foreground">
                            Toggle between light and dark mode
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleTheme}
                          className="gap-2"
                        >
                          {theme === "light" ? (
                            <>
                              <span>🌙</span> Switch to Dark
                            </>
                          ) : (
                            <>
                              <span>☀️</span> Switch to Light
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Section */}
                {activeSection === "privacy" && (
                  <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
                    <h2 className="text-lg font-semibold text-foreground mb-6">Privacy</h2>
                    <p className="text-sm text-muted-foreground">Privacy settings coming soon.</p>
                  </div>
                )}

                {/* Subscription Section */}
                {activeSection === "subscription" && (
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
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
