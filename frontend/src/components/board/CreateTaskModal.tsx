import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useCreateTask } from "../../hooks/useTasks";
import type { ProjectMember } from "../../types";
import { getSocket } from "../../lib/socket";

type Props = {
  projectId: string;
  columnId: string;
  members: ProjectMember[];
  onClose: () => void;
};

const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export default function CreateTaskModal({
  projectId,
  columnId,
  members,
  onClose,
}: Props) {
  const { mutateAsync, isPending } = useCreateTask(projectId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] =
    useState<(typeof priorities)[number]>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    try {
      const task = await mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        columnId,
        assigneeId: assigneeId || undefined,
      });
      getSocket().emit("task-created", { projectId, task });
      onClose();
    } catch {
      setError("Failed to create task. Try again.");
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal fade-in-scale">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="font-semibold text-[16px] text-ink">New Task</h2>
            <p className="text-[12px] text-ink-dim mt-0.5">
              Add a task to this column
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body flex flex-col gap-5">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="input"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              maxLength={100}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
            />
          </div>

          {/* Priority + Assignee row */}
          <div className="flex gap-4">
            <div className="form-group flex-1">
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

            <div className="form-group flex-1">
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
          </div>

          {error && <p className="form-error">{error}</p>}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !title.trim()}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} />
            {isPending ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
