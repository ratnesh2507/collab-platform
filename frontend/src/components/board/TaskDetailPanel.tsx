import { useState } from "react";
import { X, Trash2, Save } from "lucide-react";
import type { Task, ProjectMember } from "../../types";
import { useUpdateTask, useDeleteTask } from "../../hooks/useTasks";

type Props = {
  task: Task;
  projectId: string;
  members: ProjectMember[];
  onClose: () => void;
};

const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const priorityClass: Record<string, string> = {
  LOW: "priority-low",
  MEDIUM: "priority-medium",
  HIGH: "priority-high",
  CRITICAL: "priority-critical",
};

export default function TaskDetailPanel({
  task,
  projectId,
  members,
  onClose,
}: Props) {
  const { mutateAsync: updateTask, isPending: isUpdating } =
    useUpdateTask(projectId);
  const { mutateAsync: deleteTask, isPending: isDeleting } =
    useDeleteTask(projectId);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<(typeof priorities)[number]>(
    task.priority,
  );
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasChanges =
    title !== task.title ||
    description !== (task.description ?? "") ||
    priority !== task.priority ||
    assigneeId !== (task.assigneeId ?? "");

  const handleSave = async () => {
    await updateTask({
      taskId: task.id,
      data: {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        assigneeId: assigneeId || null,
      },
    });
    onClose();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-surface border-l border-border flex flex-col h-full slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <span className={`badge ${priorityClass[priority]}`}>
              {priority}
            </span>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              maxLength={1000}
              rows={5}
            />
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="input"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as (typeof priorities)[number])
              }
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div className="form-group">
            <label className="form-label">Assignee</label>
            <select
              className="input"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Meta */}
          <div className="divider-solid" />
          <div className="flex flex-col gap-1.5">
            <p className="text-[12px] text-ink-ghost">
              Created by {task.creator.name}
            </p>
            <p className="text-[12px] text-ink-ghost">
              {new Date(task.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-danger">Sure?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-danger btn-xs"
              >
                {isDeleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="btn btn-secondary btn-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn btn-danger btn-sm"
            >
              <Trash2 size={13} />
              Delete
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isUpdating || !hasChanges}
            className="btn btn-primary btn-sm"
          >
            <Save size={13} />
            {isUpdating ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
