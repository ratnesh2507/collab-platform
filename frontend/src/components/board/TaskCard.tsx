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
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card flex flex-col gap-2.5"
      onClick={() => onClick(task)}
    >
      {/* Title */}
      <p className="text-[13px] text-ink-mid leading-snug">{task.title}</p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
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
            className="avatar"
            style={{ width: 20, height: 20 }}
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-surface-2 border border-border flex items-center justify-center">
            <User size={10} className="text-ink-ghost" />
          </div>
        )}
      </div>
    </div>
  );
}
