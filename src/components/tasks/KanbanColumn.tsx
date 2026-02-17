import { useState } from "react";
import type { Task, TaskColumn } from "@/types/task";
import { COLUMN_BG } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: TaskColumn;
  title: string;
  colorClass: string;
  tasks: Task[];
  onDrop: (taskId: string, column: TaskColumn) => void;
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({ id, title, colorClass, tasks, onDrop, onTaskClick }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = () => setIsOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) onDrop(taskId, id);
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border-t-4 min-w-[280px]",
        colorClass,
        COLUMN_BG[id],
        isOver && "ring-2 ring-primary/40 border-dashed"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-2 min-h-[120px]">
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">No tasks</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onMoveTask={onDrop} columnId={id} />
          ))
        )}
      </div>
    </div>
  );
}
