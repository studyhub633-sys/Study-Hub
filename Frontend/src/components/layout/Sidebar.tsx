import AnimatedLogoIcon from "@/components/AnimatedLogoIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Award,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Crown,
  FileText,
  Layers,
  LayoutDashboard,
  Library,
  LogOut,
  Moon,
  Settings,
  Sun
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: BookOpen, label: "Exam Notes", path: "/notes" },
  { icon: Layers, label: "Flashcards", path: "/flashcards" },
  { icon: FileText, label: "Past Papers", path: "/past-papers" },
  { icon: Brain, label: "Knowledge Organizers", path: "/knowledge" },
  { icon: Library, label: "Global Library", path: "/library" },
  { icon: Award, label: "Extracurriculars", path: "/extracurricular" },
];

const bottomNavItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut, supabase } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAvatar = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    };

    fetchAvatar();
  }, [user, supabase]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/landing");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-out flex flex-col",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <AnimatedLogoIcon />
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg text-sidebar-foreground">Study Hub</h1>
              <p className="text-xs text-muted-foreground">Learn smarter</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8 text-muted-foreground hover:text-sidebar-foreground", collapsed && "hidden")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>


      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-2",
                `animate-slide-in-left stagger-${index + 1}`
              )}
              style={{ opacity: 0 }}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "animate-bounce-subtle")} />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Premium Section */}
        <div className={cn("mt-6 pt-4 border-t border-sidebar-border", collapsed && "border-none mt-4 pt-2")}>
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider animate-fade-in">
              Premium
            </p>
          )}
          <NavLink
            to="/premium"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              location.pathname === "/premium"
                ? "bg-premium text-premium-foreground"
                : "text-muted-foreground hover:text-premium hover:bg-premium/10",
              collapsed && "justify-center px-2"
            )}
          >
            <Crown className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Go Premium</span>
                <span className="premium-badge">PRO</span>
              </div>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </NavLink>
          );
        })}

        {/* User Profile */}
        <div className={cn(
          "mt-3 p-3 rounded-xl bg-sidebar-accent flex items-center gap-3",
          collapsed && "justify-center p-2"
        )}>
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage
              src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
            />
            <AvatarFallback>
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className={cn(
            "mt-2 w-full justify-start text-muted-foreground hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 flex-shrink-0" />
          ) : (
            <Sun className="h-5 w-5 flex-shrink-0" />
          )}
          {!collapsed && (
            <span className="font-medium text-sm ml-3">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </span>
          )}
        </Button>

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "mt-2 w-full justify-start text-muted-foreground hover:text-destructive",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm ml-3">Sign Out</span>}
        </Button>
      </div>

      {/* Collapse Toggle (when collapsed) */}
      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="absolute top-4 -right-4 h-8 w-8 rounded-full bg-card border border-border shadow-md text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </aside>
  );
}
