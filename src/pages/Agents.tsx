import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { api, type AgentId } from "@/lib/api";
import { formatDistanceToNow, format } from "date-fns";
import { Bot, Download, Activity, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const AGENT_IDS: AgentId[] = ["milo", "analyst", "author", "comms", "docs", "researcher"];

function getSuccessRateColor(rate: number) {
  if (rate > 90) return "text-green-500";
  if (rate > 70) return "text-yellow-500";
  return "text-red-500";
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
}

function exportAsJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" {
  if (status === "running") return "default";
  if (status === "error") return "destructive";
  return "secondary";
}

const Agents = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const queries = useQueries({
    queries: AGENT_IDS.map((id) => ({
      queryKey: ["agent-analytics", id],
      queryFn: () => api.getAgentAnalytics(id),
      refetchInterval: 10000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const hasError = queries.some((q) => q.isError);

  // Derive agent data
  const agents = AGENT_IDS.map((id, i) => {
    const result = queries[i].data;
    if (!result || !result.ok) return { id, data: null };
    return { id, data: result as Record<string, any> };
  });

  // Global stats
  const totalTasks = agents.reduce((sum, a) => {
    if (!a.data) return sum;
    return sum + (a.data.tasksCompleted || 0) + (a.data.failures || 0);
  }, 0);

  const globalSuccessRate = (() => {
    let totalCompleted = 0;
    let totalAll = 0;
    agents.forEach((a) => {
      if (!a.data) return;
      const completed = a.data.tasksCompleted || 0;
      const failed = a.data.failures || 0;
      totalCompleted += completed;
      totalAll += completed + failed;
    });
    return totalAll > 0 ? (totalCompleted / totalAll) * 100 : 0;
  })();

  const selectedData = agents.find((a) => a.id === selectedAgent)?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Agents</h1>
      </div>

      {/* Global Stats */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <span className="text-3xl font-bold">{totalTasks}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Global Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`text-3xl font-bold ${getSuccessRateColor(globalSuccessRate)}`}>
                {globalSuccessRate.toFixed(1)}%
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agent Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {AGENT_IDS.map((id) => (
            <Card key={id}>
              <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : hasError ? (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-destructive">Failed to load agent data.</span>
            <Button variant="outline" size="sm" onClick={() => queries.forEach((q) => q.refetch())}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agents.map((agent) => {
            const d = agent.data;
            const status = d?.status || "idle";
            const successRate = d?.successRate ?? 0;
            const completed = d?.tasksCompleted ?? 0;
            const failures = d?.failures ?? 0;
            const avgDuration = d?.avgDuration ?? 0;
            const lastTaskTime = d?.lastTaskTime;
            const errorPatterns = d?.errorPatterns as Record<string, number> | undefined;

            return (
              <Card
                key={agent.id}
                className="cursor-pointer transition-colors hover:border-primary/50"
                onClick={() => setSelectedAgent(agent.id)}
              >
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg capitalize">{agent.id}</CardTitle>
                  <Badge variant={getStatusVariant(status)}>{status}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`text-3xl font-bold ${getSuccessRateColor(successRate)}`}>
                    {successRate.toFixed(1)}%
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>{completed} tasks completed</li>
                    <li>{failures} failures</li>
                    <li>Avg {formatDuration(avgDuration)} duration</li>
                    {lastTaskTime && (
                      <li>Last task: {formatDistanceToNow(new Date(lastTaskTime), { addSuffix: true })}</li>
                    )}
                  </ul>
                  {errorPatterns && Object.keys(errorPatterns).length > 0 && (
                    <div className="pt-1">
                      <p className="text-xs font-medium text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Error patterns
                      </p>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        {Object.entries(errorPatterns).map(([pattern, count]) => (
                          <li key={pattern}>{pattern}: {count}x</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedAgent} onOpenChange={(open) => !open && setSelectedAgent(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 capitalize">
              <Bot className="h-5 w-5" />
              {selectedAgent}
              {selectedData && (
                <Badge variant={getStatusVariant(selectedData.status || "idle")}>
                  {selectedData.status || "idle"}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Chart */}
              {selectedData?.taskHistory && (selectedData.taskHistory as any[]).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Task History</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={selectedData.taskHistory as any[]}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v: string) => {
                          try { return format(new Date(v), "MM/dd"); } catch { return v; }
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="successes" fill="hsl(142, 71%, 45%)" name="Successes" />
                      <Bar dataKey="failures" fill="hsl(0, 84%, 60%)" name="Failures" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent Tasks Table */}
              {selectedData?.recentTasks && (selectedData.recentTasks as any[]).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Recent Tasks</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedData.recentTasks as any[]).slice(0, 10).map((task: any, i: number) => (
                        <TableRow key={task.id || i}>
                          <TableCell className="font-mono text-xs">{task.id || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={task.status === "success" ? "default" : "destructive"}>
                              {task.status || "unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>{task.duration ? formatDuration(task.duration) : "—"}</TableCell>
                          <TableCell>
                            {task.date ? format(new Date(task.date), "MMM d, HH:mm") : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Export */}
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => selectedData && exportAsJson(selectedData, `${selectedAgent}-analytics.json`)}
              >
                <Download className="h-4 w-4" /> Export JSON
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Agents;
