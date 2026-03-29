import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GitBranch, LogOut, ArrowLeft, Activity } from "lucide-react";
import { Settings } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useBoard, useMoveTask } from "../hooks/useTasks";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";
import type { Task } from "../types";
import BoardColumn from "../components/board/BoardColumn";
import TaskDetailPanel from "../components/board/TaskDetailPanel";
import ProjectSettingsModal from "../components/projects/ProjectSettingsModal";
import NotificationBell from "../components/ui/NotificationBell";
import ActivityFeed from "../components/board/ActivityFeed";
import { connectSocket, getSocket } from "../lib/socket";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";

export default function Board() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { reset } = useAuthStore();
  const navigate = useNavigate();
  const { data: project, isLoading, refetch } = useBoard(projectId!);
  const { mutate: moveTask } = useMoveTask(projectId!);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [showActivity, setShowActivity] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingUsers, setEditingUsers] = useState<
    Record<string, { id: string; name: string; avatar: string }>
  >({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Socket setup
  useEffect(() => {
    if (!projectId) return;

    const socket = connectSocket(user?.id);
    socket.emit("join-project", projectId);

    socket.on("task-created", () => refetch());
    socket.on("task-updated", () => refetch());
    socket.on("task-deleted", () => refetch());
    socket.on("task-moved", () => refetch());
    socket.on("user-joined", () => setOnlineCount((c) => c + 1));
    socket.on("user-left", () => setOnlineCount((c) => Math.max(1, c - 1)));
    socket.on("task-editing-start", ({ taskId, user }) => {
      setEditingUsers((prev) => ({ ...prev, [taskId]: user }));
    });

    socket.on("task-editing-stop", ({ taskId }) => {
      setEditingUsers((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    });

    return () => {
      // Leave project room but don't disconnect —
      // socket is still needed for notifications on other pages
      socket.emit("leave-project", projectId);
      socket.off("task-created");
      socket.off("task-updated");
      socket.off("task-deleted");
      socket.off("task-moved");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("task-editing-start");
      socket.off("task-editing-stop");
    };
  }, [projectId, refetch, user?.id]);

  const handleLogout = async () => {
    await api.post("/api/auth/logout");
    reset();
    navigate("/");
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = project?.columns
      .flatMap((c) => c.tasks)
      .find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || !project) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    let targetColumnId: string | null = null;
    let targetOrder = 0;

    for (const col of project.columns) {
      if (col.id === overId) {
        targetColumnId = col.id;
        targetOrder = col.tasks.length;
        break;
      }
      const taskIndex = col.tasks.findIndex((t) => t.id === overId);
      if (taskIndex !== -1) {
        targetColumnId = col.id;
        targetOrder = taskIndex;
        break;
      }
    }

    if (!targetColumnId) return;

    const sourceColumn = project.columns.find((c) =>
      c.tasks.some((t) => t.id === taskId),
    );
    if (!sourceColumn) return;

    if (sourceColumn.id === targetColumnId) {
      const currentIndex = sourceColumn.tasks.findIndex((t) => t.id === taskId);
      if (currentIndex === targetOrder) return;
    }

    // Fire without await — optimistic update already happened in onMutate
    moveTask(
      { taskId, columnId: targetColumnId, order: targetOrder },
      {
        onError: () => {
          // Card will snap back via onError rollback in useMoveTask
          // Optionally show a toast here
          console.error("Failed to move task — changes rolled back");
        },
      },
    );

    // Notify other board members
    getSocket().emit("task-moved", {
      projectId,
      taskId,
      columnId: targetColumnId,
      order: targetOrder,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="loading-dot"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!project) return null;
  const isOwner = project.ownerId === user?.id;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Navbar */}
      <nav className="navbar shrink-0">
        {/* Left — navigation + project identity */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-icon tooltip tooltip-down"
            data-tip="Back to dashboard"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="divider-solid w-px h-5" />

          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-primary to-accent-dim shrink-0">
            <GitBranch size={13} color="white" />
          </div>
          <span className="font-semibold text-[15px] text-ink">
            {project.name}
          </span>

          {project.tags.length > 0 && (
            <div className="hidden md:flex gap-1.5 ml-1">
              {project.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {isOwner && (
            <button
              onClick={() => setShowSettings(true)}
              className="btn-icon tooltip tooltip-down"
              data-tip="Project settings"
            >
              <Settings size={14} />
            </button>
          )}
        </div>

        {/* Right — presence + actions */}
        <div className="flex items-center gap-2">
          {/* Online count */}
          <div className="hidden md:flex items-center gap-1.5 text-[12px] text-ink-dim mr-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            {onlineCount} online
          </div>

          {/* Stacked member avatars */}
          <div className="hidden md:flex items-center">
            {project.members.slice(0, 4).map((m, i) => (
              <img
                key={m.id}
                src={m.user.avatar}
                alt={m.user.username}
                width={26}
                height={26}
                referrerPolicy="no-referrer"
                className="avatar w-6.5 h-6.5 border-2 border-bg"
                style={{ marginLeft: i > 0 ? -8 : 0 }}
                title={m.user.name}
              />
            ))}
          </div>

          <div className="divider-solid w-px h-5 mx-1" />

          {/* Activity feed */}
          <button
            onClick={() => setShowActivity(true)}
            className="btn-icon tooltip tooltip-down"
            data-tip="Activity feed"
          >
            <Activity size={15} />
          </button>

          {/* Notifications */}
          <NotificationBell />

          <div className="divider-solid w-px h-5 mx-1" />

          {/* User avatar */}
          {user && (
            <div className="relative w-7 h-7 shrink-0">
              <img
                src={user.avatar}
                alt={user.username}
                width={28}
                height={28}
                className="avatar w-full h-full"
                referrerPolicy="no-referrer"
              />
              <span className="online-dot absolute -bottom-0.5 -right-0.5" />
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn-icon tooltip tooltip-down"
            data-tip="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-container">
          {project.columns?.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              projectId={project.id}
              members={project.members}
              onTaskClick={setSelectedTask}
              editingUsers={editingUsers}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="task-card flex flex-col gap-2 opacity-90 shadow-lg rotate-1">
              <p className="text-[13px] text-ink font-medium leading-snug">
                {activeTask.title}
              </p>
              <span
                className={`badge text-[10px] w-fit priority-${activeTask.priority.toLowerCase()}`}
              >
                {activeTask.priority}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          projectId={project.id}
          members={project.members}
          onClose={() => setSelectedTask(null)}
          currentUser={user!}
        />
      )}

      {/* Activity feed */}
      {showActivity && (
        <ActivityFeed
          projectId={project.id}
          onClose={() => setShowActivity(false)}
        />
      )}
      {/* Project Settings modal */}
      {showSettings && (
        <ProjectSettingsModal
          project={project}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
