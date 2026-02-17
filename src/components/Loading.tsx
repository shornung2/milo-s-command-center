import { Skeleton } from "@/components/ui/skeleton";

interface LoadingProps {
  lines?: number;
}

const widths = ["w-full", "w-3/4", "w-5/6", "w-2/3", "w-4/5"];

export function Loading({ lines = 3 }: LoadingProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}
