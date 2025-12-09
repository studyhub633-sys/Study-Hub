import { Sparkles, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function WelcomeCard() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 md:p-8" style={{ background: "var(--gradient-primary)" }}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{greeting}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">
              Welcome back, Jamie!
            </h2>
            <p className="text-primary-foreground/80 max-w-md">
              You're making great progress. Keep up the momentum!
            </p>
          </div>
          
          <div className="glass-card bg-white/10 backdrop-blur-sm border-white/20 p-4 rounded-xl min-w-[160px]">
            <div className="flex items-center gap-2 text-primary-foreground/80 text-sm mb-2">
              <TrendingUp className="h-4 w-4" />
              <span>Weekly Progress</span>
            </div>
            <div className="text-3xl font-bold text-primary-foreground mb-2">73%</div>
            <Progress value={73} className="h-2 bg-white/20" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Notes Reviewed", value: "24", change: "+3 today" },
            { label: "Cards Mastered", value: "156", change: "+12 this week" },
            { label: "Papers Done", value: "8", change: "2 pending" },
            { label: "Study Streak", value: "7 days", change: "🔥 Keep going!" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
            >
              <p className="text-primary-foreground/70 text-xs mb-1">{stat.label}</p>
              <p className="text-primary-foreground font-bold text-lg">{stat.value}</p>
              <p className="text-primary-foreground/60 text-xs mt-0.5">{stat.change}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
