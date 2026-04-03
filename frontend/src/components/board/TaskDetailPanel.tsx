import { useState, useEffect } from "react";
import { X, Trash2, Save, Calendar, User } from "lucide-react";
import type { Task, ProjectMember } from "../../types";
import type { User as UserType } from "../../types";
import { useUpdateTask, useDeleteTask } from "../../hooks/useTasks";
import { getSocket } from "../../lib/socket";
import RichTextEditor from "../ui/RichTextEditor";
import { useAISuggest } from "../../hooks/useAISuggest";
import { useCreateTask } from "../../hooks/useTasks";
import type { AISuggestion } from "../../types";
import { Sparkles, Check, X as XIcon } from "lucide-react";

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

  //AI suggestion states
  const { mutate: getAISuggestions, isPending: isLoadingAI } = useAISuggest(
    projectId,
    task.id,
  );
  const { mutateAsync: createTask } = useCreateTask(projectId);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [rejectedSubtasks, setRejectedSubtasks] = useState<Set<number>>(
    new Set(),
  );
  const [acceptedPriority, setAcceptedPriority] = useState(false);
  const [isCreatingSubtasks, setIsCreatingSubtasks] = useState(false);
  const [subtaskCount, setSubtaskCount] = useState(0);

  const hasChanges =
    title !== task.title ||
    description !== (task.description ?? "") ||
    priority !== task.priority ||
    assigneeId !== (task.assigneeId ?? "");

  const handleSave = async () => {
    // Extract @mentioned user IDs from the HTML
    const mentionedIds = [...description.matchAll(/data-id="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((id) => id !== currentUser.id); // don't notify yourself

    const updated = await updateTask({
      taskId: task.id,
      data: {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        assigneeId: assigneeId || null,
      },
    });

    getSocket().emit("task-updated", { projectId, task: updated });

    // Emit mention notifications
    if (mentionedIds.length > 0) {
      getSocket().emit("task-mention", {
        projectId,
        taskId: task.id,
        taskTitle: updated.title,
        mentionedIds,
        mentionedBy: {
          id: currentUser.id,
          name: currentUser.name,
        },
      });
    }

    onClose();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    getSocket().emit("task-deleted", { projectId, taskId: task.id });
    onClose();
  };

  const selectedMember = members.find((m) => m.user.id === assigneeId);

  const handleAISuggest = () => {
    setAiSuggestion(null);
    setRejectedSubtasks(new Set());
    setAcceptedPriority(false);
    getAISuggestions(undefined, {
      onSuccess: (data) => setAiSuggestion(data),
    });
  };

  const handleAcceptPriority = () => {
    setPriority(aiSuggestion!.suggestedPriority);
    setAcceptedPriority(true);
  };

  const handleAcceptSubtasks = async () => {
    if (!aiSuggestion) return;
    const toCreate = aiSuggestion.subtasks.filter(
      (_, i) => !rejectedSubtasks.has(i),
    );
    setSubtaskCount(toCreate.length);
    setIsCreatingSubtasks(true);

    try {
      await Promise.all(
        toCreate.map((subtask) =>
          createTask({
            title: subtask.title,
            priority: subtask.priority,
            columnId: task.columnId,
          }),
        ),
      );
      getSocket().emit("task-created", { projectId });
      onClose();
    } finally {
      setIsCreatingSubtasks(false);
    }
  };

  const toggleRejectSubtask = (index: number) => {
    setRejectedSubtasks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

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
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Add a description..."
              members={members}
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
          {/* AI Suggestions */}
          {aiSuggestion && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-primary shrink-0" />
                <span className="text-[12px] font-semibold text-primary">
                  AI Suggestions
                </span>
              </div>

              {/* Priority suggestion */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] text-ink-dim font-medium">
                  Suggested Priority
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`badge w-fit priority-${aiSuggestion.suggestedPriority.toLowerCase()}`}
                    >
                      {aiSuggestion.suggestedPriority}
                    </span>
                    <p className="text-[10px] text-ink-ghost">
                      {aiSuggestion.priorityReason}
                    </p>
                  </div>
                  {!acceptedPriority &&
                    aiSuggestion.suggestedPriority !== priority && (
                      <button
                        onClick={handleAcceptPriority}
                        className="btn btn-primary btn-xs shrink-0"
                      >
                        <Check size={11} />
                        Apply
                      </button>
                    )}
                  {acceptedPriority && (
                    <span className="text-[10px] text-success font-medium">
                      Applied ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Subtasks */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] text-ink-dim font-medium">
                  Suggested Subtasks
                </p>
                <div className="flex flex-col gap-1">
                  {aiSuggestion.subtasks.map((subtask, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md border transition-colors ${
                        rejectedSubtasks.has(i)
                          ? "border-border bg-surface opacity-50"
                          : "border-primary/20 bg-surface"
                      }`}
                    >
                      <span
                        className={`badge text-[9px] priority-${subtask.priority.toLowerCase()} shrink-0`}
                      >
                        {subtask.priority}
                      </span>
                      <p
                        className={`text-[11px] flex-1 leading-snug ${rejectedSubtasks.has(i) ? "line-through text-ink-ghost" : "text-ink"}`}
                      >
                        {subtask.title}
                      </p>
                      <button
                        onClick={() => toggleRejectSubtask(i)}
                        className="btn-icon w-5 h-5 shrink-0"
                      >
                        <XIcon size={10} className="text-ink-ghost" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAcceptSubtasks}
                  disabled={
                    rejectedSubtasks.size === aiSuggestion.subtasks.length
                  }
                  className="btn btn-primary btn-sm mt-1"
                >
                  <Check size={13} />
                  Add {aiSuggestion.subtasks.length -
                    rejectedSubtasks.size}{" "}
                  Subtask
                  {aiSuggestion.subtasks.length - rejectedSubtasks.size !== 1
                    ? "s"
                    : ""}
                </button>
              </div>
            </div>
          )}
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
                onClick={handleAISuggest}
                disabled={isLoadingAI}
                className="btn btn-secondary btn-sm"
              >
                <Sparkles
                  size={13}
                  className={isLoadingAI ? "animate-pulse text-primary" : ""}
                />
                {isLoadingAI ? "Thinking..." : "AI Suggest"}
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
      {/* Subtask creation overlay */}
      {isCreatingSubtasks && (
        <div className="fixed inset-0 z-60 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface border border-border shadow-xl">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="loading-dot"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-[14px] font-semibold text-ink">
              Creating subtasks...
            </p>
            <p className="text-[12px] text-ink-ghost">
              Adding {subtaskCount} task{subtaskCount !== 1 ? "s" : ""} to your
              board
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
