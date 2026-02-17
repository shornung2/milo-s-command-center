import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { KanbanColumn } from "@/components/tasks/KanbanColumn";
import { TaskModal } from "@/components/tasks/TaskModal";
import { COLUMNS } from "@/types/task";
import type { Task } from "@/types/task";
import { Button } from "@/components/Button";
import { Plus } from "lucide-react";

const Tasks = () => {
  const { tasks, moveTask, createTask, updateTask, deleteTask } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const openNew = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Drag cards between columns or click to edit.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            colorClass={col.color}
            tasks={tasks.filter((t) => t.column === col.id)}
            onDrop={moveTask}
            onTaskClick={openEdit}
          />
        ))}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={selectedTask}
        onSave={createTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </div>
  );
};

export default Tasks;
