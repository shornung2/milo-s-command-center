import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Wifi,
  Cpu,
  Clock,
  Plus,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Activity,
} from "lucide-react";
import { useDashboardStatus } from "@/hooks/useDashboardStatus";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

// ── Helpers ────────────────────────────────────────────

function statusColor(status: string | null) {
  switch (status) {
    case "healthy":
      return "bg-green-500";
    case "degraded":
      return "bg-yellow-500";
    default:
      return "bg-red-500";
  }
}

function formatUptime(seconds: unknown): string {
  const s = Number(seconds);
  if (!s || isNaN(s)) return "--";
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  return `${days}d ${hours}h`;
}

function levelVariant(level: string): "default" | "secondary" | "destructive" {
  if (level === "error") return "destructive";
  if (level === "warning") return "secondary";
  return "default";
}

// ── Loading skeleton ───────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────

const Index = () => {
  const navigate = useNavigate();
  const { loading, error, data, refetch } = useDashboardStatus();

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-12">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const gateway = data?.status?.gateway ?? "unknown";
  const cpu = data?.status?.cpu ?? "--";
  const mem = data?.status?.mem ?? "--";
  const uptimeSeconds = data?.status?.uptime_seconds;
  const taskStats = data?.tasks ?? { total: 0, by_column: {} };
  const noteStats = data?.notes ?? { total: 0, pinned: 0 };
  const kanbanColumns = data?.kanban?.columns ?? {};
  const activityList = (data?.activity ?? []).slice(0, 20);

  // Flatten kanban columns into task items for overview
  const doingTasks = (kanbanColumns["doing"] ?? []) as Record<string, unknown>[];
  const allKanbanTasks = Object.values(kanbanColumns).flat() as Record<string, unknown>[];
  const highPriority = allKanbanTasks.filter((t) => t.priority === "high");

  return (
    <div className="space-y-6">
      {/* ── Status Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Wifi className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Gateway Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${statusColor(gateway)}`}
            />
            <span className="text-xl font-semibold capitalize">
              {gateway}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">System Stats</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              CPU:{" "}
              <span className="font-medium">
                {cpu}
              </span>
            </p>
            <p>
              Memory:{" "}
              <span className="font-medium">
                {mem}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-semibold">
              {formatUptime(uptimeSeconds)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ─────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate("/tasks")}>
          <Plus className="mr-1 h-4 w-4" /> New Task
        </Button>
        <Button variant="secondary" onClick={() => navigate("/notes")}>
          <Plus className="mr-1 h-4 w-4" /> New Note
        </Button>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-1 h-4 w-4" /> Run Sync Now
        </Button>
      </div>

      {/* ── Active Work ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] px-6 pb-4">
              {activityList.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">
                  No recent activity.
                </p>
              )}
              <div className="space-y-1">
                {activityList.map((item, i) => {
                  const ts = item.ts;
                  const level = item.level ?? "info";
                  const summary = item.summary ?? "";
                  const details = item.details;

                  return (
                    <Collapsible key={i}>
                      <CollapsibleTrigger className="w-full text-left rounded-md px-2 py-2 hover:bg-accent transition-colors">
                        <div className="flex items-start gap-2">
                          <Badge
                            variant={levelVariant(level)}
                            className="mt-0.5 shrink-0 text-[10px]"
                          >
                            {level}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{summary}</p>
                            {ts && (
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(ts), {
                                  addSuffix: true,
                                })}
                              </p>
                            )}
                          </div>
                          {details && (
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      {details && (
                        <CollapsibleContent className="px-2 pb-2">
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap pl-14">
                            {details}
                          </p>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Task Overview */}
        <div className="space-y-4">
          {[
            {
              label: "In Progress",
              items: doingTasks,
              color: "text-blue-500",
            },
            {
              label: `Total Tasks: ${taskStats.total}`,
              items: allKanbanTasks.slice(0, 5),
              color: "text-amber-500",
            },
            {
              label: "High Priority",
              items: highPriority,
              color: "text-destructive",
            },
          ].map(({ label, items, color }) => (
            <Card
              key={label}
              className="cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => navigate("/tasks")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {label}
                  <Badge variant="outline">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">None</p>
                ) : (
                  <ul className="space-y-1">
                    {items.slice(0, 3).map((t, i) => (
                      <li
                        key={i}
                        className={`text-sm truncate ${color}`}
                      >
                        {(t.title as string) ?? "Untitled"}
                      </li>
                    ))}
                    {items.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{items.length - 3} more
                      </li>
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
