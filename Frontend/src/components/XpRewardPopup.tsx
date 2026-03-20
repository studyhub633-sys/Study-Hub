import { cn } from "@/lib/utils";
import { Sparkles, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface XpRewardPopupProps {
  amount: number;
  reason?: string;
  show: boolean;
  onDone?: () => void;
}

export function XpRewardPopup({ amount, reason, show, onDone }: XpRewardPopupProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setAnimating(true);

      const timer = setTimeout(() => {
        setAnimating(false);
        setTimeout(() => {
          setVisible(false);
          onDone?.();
        }, 400);
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[100] pointer-events-none transition-all duration-500",
        animating
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95"
      )}
    >
      <div className="relative">
        {/* Glow background */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/30 to-yellow-500/30 rounded-2xl blur-xl animate-pulse" />

        {/* Main card */}
        <div className="relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-2xl shadow-amber-500/40 border border-amber-300/30">
          {/* Sparkle particles */}
          <div className="absolute -top-2 -left-2 animate-ping">
            <Star className="w-4 h-4 text-yellow-200 fill-yellow-200" />
          </div>
          <div className="absolute -top-1 -right-3 animate-ping" style={{ animationDelay: "0.3s" }}>
            <Sparkles className="w-3 h-3 text-amber-200" />
          </div>
          <div className="absolute -bottom-1 left-4 animate-ping" style={{ animationDelay: "0.6s" }}>
            <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
          </div>

          {/* Icon */}
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>

          {/* Content */}
          <div>
            <p className="text-2xl font-extrabold tracking-tight leading-none">
              +{amount} XP
            </p>
            {reason && (
              <p className="text-xs text-white/80 font-medium mt-0.5">
                {reason}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
