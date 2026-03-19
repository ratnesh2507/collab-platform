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
  Backlog: "bg-ink-dim",
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
      className={`flex flex-col min-w-65 max-w-65 bg-surface rounded-lg border transition-colors duration-150 ${isOver ? "border-primary/50" : "border-border"}`}
    >
      {/* Column header */}
      <div className="column-header">
        <div className="flex items-center gap-2">
          <span
            className={`column-dot ${columnColors[column.name] ?? "bg-ink-dim"}`}
          />
          <span className="text-[12px] font-semibold text-ink-mid uppercase tracking-wider">
            {column.name}
          </span>
          <span className="text-[11px] text-ink-ghost ml-1">
            {column.tasks.length}
          </span>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-icon">
          <Plus size={14} />
        </button>
      </div>

      {/* Tasks — droppable area */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className="flex flex-col gap-2 p-3 flex-1 min-h-30"
        >
          {column.tasks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-md min-h-20">
              <p className="text-[11px] text-ink-ghost">Drop tasks here</p>
            </div>
          ) : (
            column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))
          )}
        </div>
      </SortableContext>

      {/* Add task */}
      <div className="px-3 pb-3">
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-ghost btn-sm w-full justify-start text-ink-ghost hover:text-ink-dim"
        >
          <Plus size={13} />
          Add task
        </button>
      </div>

      {showModal && (
        <CreateTaskModal
          projectId={projectId}
          columnId={column.id}
          members={members}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
