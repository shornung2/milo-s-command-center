import { useState, useEffect } from "react";
import { Modal } from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskColumn, TaskPriority } from "@/types/task";
import type { AgentId } from "@/lib/api";
import { COLUMNS } from "@/types/task";
import { Trash2 } from "lucide-react";

const AGENTS: AgentId[] = ["milo", "analyst", "author", "comms", "docs", "researcher"];

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave: (data: { title: string; description?: string; priority: TaskPriority; column: TaskColumn; assignedTo?: AgentId }) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export function TaskModal({ open, onClose, task, onSave, onUpdate, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [column, setColumn] = useState<TaskColumn>("todo");
  const [assignedTo, setAssignedTo] = useState<string>("unassigned");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setColumn(task.column);
      setAssignedTo(task.assignedTo || "unassigned");
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setColumn("todo");
      setAssignedTo("unassigned");
    }
    setConfirmDelete(false);
  }, [task, open]);

  const handleSave = () => {
    if (!title.trim()) return;
    const agent = assignedTo === "unassigned" ? undefined : (assignedTo as AgentId);
    if (isEditing) {
      onUpdate(task.id, { title, description: description || undefined, priority, column, assignedTo: agent });
    } else {
      onSave({ title, description: description || undefined, priority, column, assignedTo: agent });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (task) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Task" : "New Task"}
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {isEditing && (
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                {confirmDelete ? "Confirm Delete" : "Delete"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title..." />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Priority</label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Column</label>
            <Select value={column} onValueChange={(v) => setColumn(v as TaskColumn)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COLUMNS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Assignee</label>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {AGENTS.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Modal>
  );
}
