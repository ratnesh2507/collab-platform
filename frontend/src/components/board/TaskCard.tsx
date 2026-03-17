import type { Task } from "../../types";
import { User } from "lucide-react";

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
  return (
    <div
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
          <div className="w-5 h-5 rounded-full bg-surface-3 border border-border flex items-center justify-center">
            <User size={10} className="text-ink-ghost" />
          </div>
        )}
      </div>
    </div>
  );
}
