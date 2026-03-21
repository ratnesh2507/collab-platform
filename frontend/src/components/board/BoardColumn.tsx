import { useState } from "react";
import { Plus } from "lucide-react";
import type { ColumnWithTasks, Task, ProjectMember } from "../../types";
import TaskCard from "./TaskCard";
import CreateTaskModal from "./CreateTaskModal";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type Props = {
  column: ColumnWithTasks;
  projectId: string;
  members: ProjectMember[];
  onTaskClick: (task: Task) => void;
};

const columnColors: Record<string, string> = {
  Backlog: "bg-border-3",
  "In Progress": "bg-warning",
  "In Review": "bg-primary",
  Done: "bg-success",
};

export default function BoardColumn({
  column,
  projectId,
  members,
  onTaskClick,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const taskIds = column.tasks.map((t) => t.id);

  return (
    <div
      className={`board-column transition-colors duration-150 ${isOver ? "border-primary/40!" : ""}`}
    >
      {/* Column header */}
      <div className="column-header">
        <div className="flex items-center gap-2">
          <span
            className={`column-dot ${columnColors[column.name] ?? "bg-border-3"}`}
          />
          <span className="text-[12px] font-semibold text-ink-mid uppercase tracking-wider">
            {column.name}
          </span>
          <span className="text-[11px] text-ink-ghost">
            {column.tasks.length}
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-icon tooltip tooltip-down"
          data-tip="Add task"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Tasks — droppable area */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`board-column-tasks transition-colors duration-150 ${isOver ? "bg-primary/5" : ""}`}
        >
          {column.tasks.length === 0 ? (
            <div
              className={`flex flex-1 items-center justify-center rounded-lg min-h-20 border border-dashed transition-colors duration-150 ${isOver ? "border-primary/40 bg-primary/5" : "border-border"}`}
            >
              <p className="text-[11px] text-ink-ghost">Drop tasks here</p>
            </div>
          ) : (
            column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))
          )}
        </div>
      </SortableContext>

      {/* Add task — bottom */}
      <div className="px-2 pb-2">
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-ghost btn-sm w-full justify-start text-ink-ghost hover:text-ink-dim"
        >
          <Plus size={12} />
          Add task
        </button>
      </div>

      {showModal && (
        <CreateTaskModal
          projectId={projectId}
          columnId={column.id}
          columnName={column.name}
          members={members}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
