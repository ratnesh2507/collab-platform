import type { Task } from "../../types";
import { User } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  task: Task;
  onClick: (task: Task) => void;
};

const priorityClass: Record<string, string> = {
  LOW: "priority-low",
  MEDIUM: "priority-medium",
  HIGH: "priority-high",
  CRITICAL: "priority-critical",
};

export default function TaskCard({ task, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card flex flex-col gap-2"
      onClick={() => !isDragging && onClick(task)}
    >
      {/* Title */}
      <p className="text-[13px] text-ink leading-snug font-medium">
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p className="text-[11px] text-ink-dim leading-snug line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-0.5">
        <span className={`badge ${priorityClass[task.priority]} text-[10px]`}>
          {task.priority}
        </span>

        {task.assignee ? (
          <img
            src={task.assignee.avatar}
            alt={task.assignee.username}
            width={20}
            height={20}
            referrerPolicy="no-referrer"
            className="avatar w-5 h-5"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-surface-3 border border-border flex items-center justify-center shrink-0">
            <User size={10} className="text-ink-ghost" />
          </div>
        )}
      </div>
    </div>
  );
}
