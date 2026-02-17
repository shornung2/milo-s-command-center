import { useState, useCallback } from "react";
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
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const moveTask = useCallback((taskId: string, newColumn: TaskColumn) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, column: newColumn, updatedAt: new Date().toISOString() } : t
      )
    );
  }, []);

  const createTask = useCallback((data: { title: string; description?: string; priority: TaskPriority; column: TaskColumn; assignedTo?: AgentId }) => {
    const task: Task = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  return { tasks, moveTask, createTask, updateTask, deleteTask };
}
