import { useState, useEffect } from "react";
import { X, Trash2, Save, Calendar, User } from "lucide-react";
import type { Task, ProjectMember } from "../../types";
import type { User as UserType } from "../../types";
import { useUpdateTask, useDeleteTask } from "../../hooks/useTasks";
import { getSocket } from "../../lib/socket";

type Props = {
  task: Task;
  projectId: string;
  members: ProjectMember[];
  onClose: () => void;
  currentUser: UserType;
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
  currentUser,
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
    const updated = await updateTask({
      taskId: task.id,
      data: {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        assigneeId: assigneeId || null,
      },
    });
    // Emit the updated task, not the stale original
    getSocket().emit("task-updated", { projectId, task: updated });
    onClose();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    getSocket().emit("task-deleted", { projectId, taskId: task.id });
    onClose();
  };

  const selectedMember = members.find((m) => m.user.id === assigneeId);

  // Emit editing presence on mount, stop on unmount
  useEffect(() => {
    const socket = getSocket();
    socket.emit("task-editing-start", {
      projectId,
      taskId: task.id,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
    });

    return () => {
      socket.emit("task-editing-stop", {
        projectId,
        taskId: task.id,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
      });
    };
  }, [projectId, task.id, currentUser]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="side-panel slide-in-right rounded-l-2xl my-3 mr-3">
        {/* Header */}
        <div className="side-panel-header rounded-tl-2xl">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-3">
            <span className={`badge w-fit ${priorityClass[priority]}`}>
              {priority}
            </span>
            <h2 className="font-semibold text-[14px] text-ink leading-snug truncate">
              {title}
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="side-panel-body px-5 py-5 flex flex-col gap-5">
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
              rows={4}
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
            <div className="flex items-center gap-2">
              {selectedMember && (
                <img
                  src={selectedMember.user.avatar}
                  alt={selectedMember.user.username}
                  width={28}
                  height={28}
                  referrerPolicy="no-referrer"
                  className="avatar w-7 h-7 shrink-0"
                />
              )}
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

          {/* Meta */}
          <div className="card-md p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <User size={11} className="text-ink-ghost shrink-0" />
              <p className="text-[11px] text-ink-ghost">
                Created by{" "}
                <span className="text-ink-dim font-medium">
                  {task.creator.name}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={11} className="text-ink-ghost shrink-0" />
              <p className="text-[11px] text-ink-ghost">
                {new Date(task.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="side-panel-footer rounded-bl-2xl">
          {confirmDelete ? (
            <div className="flex items-center gap-2 w-full">
              <p className="text-[12px] text-danger flex-1">
                This action cannot be undone.
              </p>
              <button
                onClick={() => setConfirmDelete(false)}
                className="btn btn-secondary btn-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-danger btn-xs"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={13} />
                Delete
              </button>

              <button
                onClick={handleSave}
                disabled={isUpdating || !hasChanges}
                className="btn btn-primary btn-sm tooltip tooltip-down"
                data-tip={!hasChanges ? "No changes to save" : ""}
              >
                <Save size={13} />
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
