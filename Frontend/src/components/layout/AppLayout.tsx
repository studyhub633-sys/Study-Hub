import AnimatedLogoIcon from "@/components/AnimatedLogoIcon";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { LogOut, Menu, Moon, Settings, Sparkles, Sun, User } from "lucide-react";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
      navigate("/landing");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="md:ml-72 min-h-screen transition-all duration-300">
        {/* Top Header - Mobile */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border md:hidden">
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center overflow-hidden">
                <div className="transform scale-[0.65]">
                  <AnimatedLogoIcon />
                </div>
              </div>
              <h1 className="font-bold text-lg">Study Hub</h1>
            </div>

            <div className="flex items-center gap-2">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader className="text-left pb-4">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>

                  <div className="space-y-2 mt-4">
                    {/* Account */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => handleNavigate("/settings")}
                    >
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <User className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Account</p>
                        <p className="text-xs text-muted-foreground">{user?.email || "Manage your profile"}</p>
                      </div>
                    </Button>

                    {/* Settings */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => handleNavigate("/settings")}
                    >
                      <div className="p-2 rounded-lg bg-gray-500/10">
                        <Settings className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Settings</p>
                        <p className="text-xs text-muted-foreground">App preferences</p>
                      </div>
                    </Button>

                    <Separator className="my-2" />

                    {/* Dark/Light Mode Toggle */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={toggleTheme}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        theme === "dark" ? "bg-yellow-500/10" : "bg-indigo-500/10"
                      )}>
                        {theme === "dark" ? (
                          <Sun className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Moon className="h-5 w-5 text-indigo-500" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</p>
                        <p className="text-xs text-muted-foreground">Switch to {theme === "dark" ? "light" : "dark"} theme</p>
                      </div>
                    </Button>

                    <Separator className="my-2" />

                    {/* Sign Out */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleSignOut}
                    >
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Sign Out</p>
                        <p className="text-xs text-muted-foreground">Log out of your account</p>
                      </div>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Floating AI Status Indicator */}
      <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 pointer-events-none select-none animate-fade-in">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-premium/10 backdrop-blur-md border border-premium/20 shadow-lg shadow-premium/10 group">
          <div className="relative">
            <Sparkles className="h-4 w-4 text-premium animate-pulse-subtle" />
            <div className="absolute inset-0 bg-premium/20 blur-md rounded-full animate-pulse-glow" />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-premium to-purple-400 bg-clip-text text-transparent italic tracking-tight">
            Generate with AI
          </span>
        </div>
      </div>
    </div>
  );
}
