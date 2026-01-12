import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  count?: number;
  countLabel: string;
  path: string;
  color: "primary" | "secondary" | "accent" | "premium";
  isPremium?: boolean;
  progress?: number;
}

const colorStyles = {
  primary: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    hoverBorder: "hover:border-primary/30",
  },
  secondary: {
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    hoverBorder: "hover:border-secondary/30",
  },
  accent: {
    iconBg: "bg-accent/20",
    iconColor: "text-accent-foreground",
    hoverBorder: "hover:border-accent/30",
  },
  premium: {
    iconBg: "bg-premium/10",
    iconColor: "text-premium",
    hoverBorder: "hover:border-premium/30",
  },
};

export function ModuleCard({
  icon: Icon,
  title,
  description,
  count = 0,
  countLabel,
  path,
  color,
  isPremium = false,
  progress,
}: ModuleCardProps) {
  const styles = colorStyles[color];
  const isExternal = path.startsWith("http");
  const content = (
    <div
      className={cn(
        "module-card relative overflow-hidden transition-all duration-300",
        styles.hoverBorder,
        "hover:shadow-lg"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl transition-transform duration-300 group-hover:scale-110", styles.iconBg)}>
          <Icon className={cn("h-6 w-6", styles.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {title}
            </h3>
            {isPremium && (
              <span className="premium-badge shrink-0">PRO</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-foreground">{count}</span>
          <span className="text-sm text-muted-foreground ml-2">{countLabel}</span>
        </div>
        {progress !== undefined && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", `bg-${color}`)}
                style={{
                  width: `${progress}%`,
                  backgroundColor: color === "primary" ? "hsl(var(--primary))" :
                    color === "secondary" ? "hsl(var(--secondary))" :
                      color === "accent" ? "hsl(var(--accent))" : "hsl(var(--premium))"
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a href={path} className="block group">
        {content}
      </a>
    );
  }

  return (
    <Link to={path} className="block group">
      {content}
    </Link>
  );
}
