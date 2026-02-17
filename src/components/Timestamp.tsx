import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

interface TimestampProps {
  ts: string;
  className?: string;
}

export function Timestamp({ ts, className }: TimestampProps) {
  const date = new Date(ts);
  const relative = formatDistanceToNow(date, { addSuffix: true });
  const full = format(date, "PPpp");

  return (
    <time dateTime={ts} title={full} className={cn("text-sm text-muted-foreground", className)}>
      {relative}
    </time>
  );
}
