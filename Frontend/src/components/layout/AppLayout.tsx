import AnimatedLogoIcon from "@/components/AnimatedLogoIcon";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Crown, LogOut, Menu, Moon, Settings, Sun, User } from "lucide-react";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export function AppLayout({ children, fullWidth = false }: AppLayoutProps) {
  const { signOut, user } = useAuth();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
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
      <main className="md:ml-72 min-h-screen transition-all duration-300 flex flex-col">
        {/* Top Header - Mobile */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border md:hidden">
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center overflow-hidden">
                <div className="transform scale-[0.65]">
                  <AnimatedLogoIcon />
                </div>
              </div>
              <h1 className="font-bold text-lg">Scientia.ai</h1>
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
                    {/* Premium Link - Mobile Exclusive Position */}
                    <Button
                      className={cn(
                        "w-full justify-between gap-3 h-12 relative overflow-hidden group mb-4",
                        location.pathname === "/premium-dashboard"
                          ? "bg-premium text-premium-foreground hover:bg-premium/90 shadow-lg shadow-premium/20"
                          : "bg-premium/5 text-foreground hover:bg-premium/10 border border-premium/20"
                      )}
                      onClick={() => handleNavigate("/premium-dashboard")}
                    >
                      <div className="flex items-center gap-3 z-10">
                        <Crown className={cn("h-5 w-5 text-premium", location.pathname === "/premium-dashboard" && "text-premium-foreground")} />
                        <span className="font-bold tracking-tight">{t("sidebar.goPremium")}</span>
                      </div>
                      <div className="flex items-center gap-2 z-10">
                        <span className="text-[10px] bg-background/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {t("sidebar.upgradePlan")}
                        </span>
                      </div>
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </Button>

                    <Separator className="my-2" />

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
                        <p className="font-medium">{t("sidebar.account")}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || t("sidebar.manageProfile")}</p>
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
                        <p className="font-medium">{t("common.settings")}</p>
                        <p className="text-xs text-muted-foreground">{t("sidebar.appPreferences")}</p>
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
                        <p className="font-medium">{theme === "dark" ? t("sidebar.lightMode") : t("sidebar.darkMode")}</p>
                        <p className="text-xs text-muted-foreground">{theme === "dark" ? t("sidebar.switchToLight") : t("sidebar.switchToDark")}</p>
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
                        <p className="font-medium">{t("common.logout")}</p>
                        <p className="text-xs text-muted-foreground">{t("common.logout")}</p>
                      </div>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={cn(
          "flex-1",
          fullWidth ? "p-0" : "p-4 md:p-8 pb-24 md:pb-8"
        )}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />


    </div>
  );
}
