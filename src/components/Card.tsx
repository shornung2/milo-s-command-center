import { cn } from "@/lib/utils";
import { Card as UiCard } from "@/components/ui/card";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <UiCard className={cn(className)}>{children}</UiCard>;
}
