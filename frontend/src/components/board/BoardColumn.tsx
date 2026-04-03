import { useState } from "react";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";
import type { ColumnWithTasks, Task, ProjectMember } from "../../types";
import TaskCard from "./TaskCard";
import CreateTaskModal from "./CreateTaskModal";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBatchDeleteTasks } from "../../hooks/useTasks";
import { getSocket } from "../../lib/socket";

type Props = {
  column: ColumnWithTasks;
  projectId: string;
  members: ProjectMember[];
  onTaskClick: (task: Task) => void;
  editingUsers: Record<string, { id: string; name: string; avatar: string }>;
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
  editingUsers,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const taskIds = column.tasks.map((t) => t.id);
  const { mutate: batchDelete, isPending: isDeleting } =
    useBatchDeleteTasks(projectId);

  const toggleSelect = (taskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === column.tasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(column.tasks.map((t) => t.id)));
    }
  };

  const handleExitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
    setConfirmBatchDelete(false);
  };

  const handleBatchDelete = () => {
    batchDelete(Array.from(selectedIds), {
      onSuccess: () => {
        getSocket().emit("task-deleted", { projectId });
        handleExitSelectMode();
      },
    });
  };

  const allSelected =
    column.tasks.length > 0 && selectedIds.size === column.tasks.length;

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
        <div className="flex items-center gap-1">
          {selectMode ? (
            <>
              {/* Select all toggle */}
              <button
                onClick={handleSelectAll}
                className="btn-icon tooltip tooltip-down"
                data-tip={allSelected ? "Deselect all" : "Select all"}
              >
                {allSelected ? (
                  <CheckSquare size={14} className="text-primary" />
                ) : (
                  <Square size={14} />
                )}
              </button>
              {/* Cancel */}
              <button
                onClick={handleExitSelectMode}
                className="btn btn-ghost btn-xs text-ink-ghost"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {column.tasks.length > 0 && (
                <button
                  onClick={() => setSelectMode(true)}
                  className="btn-icon tooltip tooltip-down"
                  data-tip="Select tasks"
                >
                  <CheckSquare size={14} />
                </button>
              )}
              <button
                onClick={() => setShowModal(true)}
                className="btn-icon tooltip tooltip-down"
                data-tip="Add task"
              >
                <Plus size={14} />
              </button>
            </>
          )}
        </div>
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
              <TaskCard
                key={task.id}
                task={task}
                onClick={selectMode ? () => toggleSelect(task.id) : onTaskClick}
                editingUser={editingUsers[task.id]}
                selectMode={selectMode}
                selected={selectedIds.has(task.id)}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Batch delete action bar */}
      {selectMode && selectedIds.size > 0 && (
        <div className="mx-2 mb-2 p-2 rounded-lg border border-danger/30 bg-danger/5 flex flex-col gap-2">
          {confirmBatchDelete ? (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-danger text-center">
                Delete {selectedIds.size} task
                {selectedIds.size !== 1 ? "s" : ""}? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmBatchDelete(false)}
                  className="btn btn-secondary btn-xs flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBatchDelete}
                  disabled={isDeleting}
                  className="btn btn-danger btn-xs flex-1"
                >
                  <Trash2 size={11} />
                  {isDeleting ? "Deleting..." : "Confirm"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmBatchDelete(true)}
              className="btn btn-danger btn-sm w-full"
            >
              <Trash2 size={13} />
              Delete {selectedIds.size} task{selectedIds.size !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {/* Add task — bottom (hidden in select mode) */}
      {!selectMode && (
        <div className="px-2 pb-2">
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-ghost btn-sm w-full justify-start text-ink-ghost hover:text-ink-dim"
          >
            <Plus size={12} />
            Add task
          </button>
        </div>
      )}

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
