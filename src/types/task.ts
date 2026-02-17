import type { AgentId } from "@/lib/api";

export type TaskColumn = "todo" | "in-progress" | "complete" | "blocked";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskComment {
  id: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  column: TaskColumn;
  priority: TaskPriority;
  assignedTo?: AgentId;
  createdAt: string;
  updatedAt?: string;
  comments?: TaskComment[];
}

export const COLUMNS: { id: TaskColumn; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "border-blue-500" },
  { id: "in-progress", title: "In Progress", color: "border-amber-500" },
  { id: "complete", title: "Complete", color: "border-green-500" },
  { id: "blocked", title: "Blocked", color: "border-red-500" },
];

export const COLUMN_BG: Record<TaskColumn, string> = {
  "todo": "bg-blue-500/5",
  "in-progress": "bg-amber-500/5",
  "complete": "bg-green-500/5",
  "blocked": "bg-red-500/5",
};
