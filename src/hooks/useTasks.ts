import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Task, TaskColumn, TaskPriority } from "@/types/task";
import type { AgentId } from "@/lib/api";

const MOCK_TASKS: Task[] = [
  { id: crypto.randomUUID(), title: "Design system audit", description: "Review all components for consistency and accessibility compliance.", column: "todo", priority: "high", assignedTo: "milo", createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Write API documentation", description: "Document all REST endpoints with request/response examples.", column: "todo", priority: "medium", assignedTo: "docs", createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Competitor analysis report", description: "Research top 5 competitors and summarize findings.", column: "in-progress", priority: "high", assignedTo: "analyst", createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Draft blog post", description: "Write a blog post about the latest product update.", column: "in-progress", priority: "low", assignedTo: "author", createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Set up monitoring alerts", description: "Configure alerts for API latency and error rates.", column: "complete", priority: "medium", createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "User onboarding flow", description: "Implement the onboarding wizard for new users.", column: "complete", priority: "high", assignedTo: "milo", createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Fix auth token refresh", description: "Token refresh fails silently when session expires during background sync.", column: "blocked", priority: "high", assignedTo: "researcher", createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: "Migrate legacy database", description: "Waiting on DevOps for staging environment access.", column: "blocked", priority: "medium", createdAt: new Date().toISOString() },
];

export function useTasks() {
  const queryClient = useQueryClient();
  const [localTasks, setLocalTasks] = useState<Task[]>(MOCK_TASKS);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.getTasks();
      if (!res.ok) throw new Error((res as { error: string }).error);
      return res;
    },
    retry: 2,
    staleTime: 15_000,
  });

  const isOffline = isError || !data;

  // Sync API data into local state when available
  useEffect(() => {
    if (data?.ok && Array.isArray((data as any).tasks)) {
      setLocalTasks((data as any).tasks);
    }
  }, [data]);

  const tasks = localTasks;

  const moveTask = useCallback((taskId: string, newColumn: TaskColumn) => {
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, column: newColumn, updatedAt: new Date().toISOString() } : t
      )
    );
    api.updateTask(taskId, { column: newColumn }).catch(() => {});
  }, []);

  const createTask = useCallback((taskData: { title: string; description?: string; priority: TaskPriority; column: TaskColumn; assignedTo?: AgentId }) => {
    const task: Task = {
      id: crypto.randomUUID(),
      ...taskData,
      createdAt: new Date().toISOString(),
    };
    setLocalTasks((prev) => [...prev, task]);
    api.createTask(taskData).then(() => queryClient.invalidateQueries({ queryKey: ["tasks"] })).catch(() => {});
    return task;
  }, [queryClient]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      )
    );
    api.updateTask(taskId, updates).catch(() => {});
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
    api.updateTask(taskId, { status: "deleted" }).catch(() => {});
  }, []);

  return { tasks, moveTask, createTask, updateTask, deleteTask, isLoading, isOffline, refetch };
}
