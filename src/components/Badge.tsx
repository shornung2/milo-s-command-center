import { cn } from "@/lib/utils";
import { Badge as UiBadge } from "@/components/ui/badge";

type BadgeVariant = "primary" | "success" | "warning" | "error" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary text-primary-foreground border-transparent",
  success: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  error: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
};

export function Badge({ variant = "primary", children, className }: BadgeProps) {
  return (
    <UiBadge className={cn(variantClasses[variant], className)}>
      {children}
    </UiBadge>
  );
}
