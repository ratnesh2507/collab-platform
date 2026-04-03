import type { Task } from "../../types";
import { User, Check } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  task: Task;
  onClick: (task: Task) => void;
  editingUser?: { id: string; name: string; avatar: string };
  selectMode?: boolean;
  selected?: boolean;
};

const priorityClass: Record<string, string> = {
  LOW: "priority-low",
  MEDIUM: "priority-medium",
  HIGH: "priority-high",
  CRITICAL: "priority-critical",
};

// Helper to convert RAW HTML to Text
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function TaskCard({
  task,
  onClick,
  editingUser,
  selectMode,
  selected,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: selectMode });

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
      {...(selectMode ? {} : listeners)}
      className={`task-card flex flex-col gap-2 transition-colors ${
        selected ? "border-primary/50 bg-primary/5" : ""
      } ${selectMode ? "cursor-pointer" : ""}`}
      onClick={() => !isDragging && onClick(task)}
    >
      {/* Title row with checkbox */}
      <div className="flex items-start gap-2">
        {selectMode && (
          <div
            className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
              selected ? "bg-primary border-primary" : "border-border"
            }`}
          >
            {selected && <Check size={10} className="text-white" />}
          </div>
        )}
        <p className="text-[13px] text-ink leading-snug font-medium flex-1">
          {task.title}
        </p>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-[11px] text-ink-dim leading-snug line-clamp-2">
          {stripHtml(task.description)}
        </p>
      )}

      {/* Editing presence indicator */}
      {editingUser && !selectMode && (
        <div className="flex items-center gap-1.5 py-1 px-2 rounded-md bg-primary/10 border border-primary/20">
          <img
            src={editingUser.avatar}
            alt={editingUser.name}
            width={14}
            height={14}
            referrerPolicy="no-referrer"
            className="avatar w-3.5 h-3.5 shrink-0"
          />
          <span className="text-[10px] text-primary font-medium truncate">
            {editingUser.name} is editing...
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0 ml-auto" />
        </div>
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
