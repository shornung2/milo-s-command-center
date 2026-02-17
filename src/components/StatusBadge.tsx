import { cn } from "@/lib/utils";

type Status = "active" | "idle" | "error" | "offline";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const dotColors: Record<Status, string> = {
  active: "bg-green-500",
  idle: "bg-amber-500",
  error: "bg-red-500",
  offline: "bg-gray-400",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <span className={cn("h-2 w-2 rounded-full", dotColors[status])} />
      <span className="capitalize">{status}</span>
    </span>
  );
}
