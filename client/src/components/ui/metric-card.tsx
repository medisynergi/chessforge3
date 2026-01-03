import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "primary" | "secondary" | "accent" | "destructive" | "default";
  className?: string;
  delay?: number;
}

export function MetricCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  color = "default",
  className,
  delay = 0,
}: MetricCardProps) {
  const colorStyles = {
    primary: "text-primary border-primary/20 bg-primary/5",
    secondary: "text-secondary border-secondary/20 bg-secondary/5",
    accent: "text-accent border-accent/20 bg-accent/5",
    destructive: "text-destructive border-destructive/20 bg-destructive/5",
    default: "text-foreground border-white/10 bg-card/40",
  };

  const iconColorStyles = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    destructive: "text-red-400",
    default: "text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 backdrop-blur-sm transition-all hover:border-white/20",
        colorStyles[color],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              {value}
            </h3>
            {subValue && (
              <span className="text-xs font-mono text-muted-foreground/80">
                {subValue}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-lg bg-white/5", iconColorStyles[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Decorative gradient line at bottom */}
      <div className={cn(
        "absolute bottom-0 left-0 h-1 w-full opacity-20",
        color === 'primary' ? 'bg-gradient-to-r from-transparent via-primary to-transparent' :
        color === 'secondary' ? 'bg-gradient-to-r from-transparent via-secondary to-transparent' :
        color === 'destructive' ? 'bg-gradient-to-r from-transparent via-destructive to-transparent' :
        'bg-white/5'
      )} />
    </motion.div>
  );
}
