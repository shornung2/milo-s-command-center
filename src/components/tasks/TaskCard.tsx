import { useState } from "react";
import type { Task, TaskColumn } from "@/types/task";
import { COLUMNS } from "@/types/task";
import { Badge } from "@/components/Badge";
import { cn } from "@/lib/utils";
import { GripVertical, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onMoveTask: (taskId: string, column: TaskColumn) => void;
  columnId: TaskColumn;
}

const priorityVariant: Record<string, "error" | "warning" | "success"> = {
  high: "error",
  medium: "warning",
  low: "success",
};

export function TaskCard({ task, onClick, onMoveTask, columnId }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => setIsDragging(false);

  const otherColumns = COLUMNS.filter((c) => c.id !== columnId);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-md border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
        isDragging && "opacity-50 rotate-1 scale-95"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-card-foreground truncate">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-0.5" />
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-1.5">
          <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
          {task.assignedTo && (
            <span className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
              {task.assignedTo}
            </span>
          )}
        </div>
        {/* Mobile move menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="md:hidden p-1 rounded hover:bg-muted"
          >
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {otherColumns.map((col) => (
              <DropdownMenuItem
                key={col.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveTask(task.id, col.id);
                }}
              >
                Move to {col.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
