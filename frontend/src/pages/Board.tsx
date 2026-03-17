import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GitBranch, LogOut, ArrowLeft, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useBoard } from "../hooks/useTasks";
import api from "../lib/api";
import type { Task } from "../types";
import BoardColumn from "../components/board/BoardColumn";
import TaskDetailPanel from "../components/board/TaskDetailPanel";

export default function Board() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: project, isLoading } = useBoard(projectId!);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleLogout = async () => {
    await api.post("/api/auth/logout");
    window.location.href = "/";
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

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Navbar */}
      <nav className="navbar shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-icon tooltip"
            data-tip="Back to dashboard"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="divider-solid w-px h-5" />
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-primary to-accent-dim">
            <GitBranch size={13} color="white" />
          </div>
          <span className="font-semibold text-[15px] text-ink">
            {project.name}
          </span>
          {project.tags.length > 0 && (
            <div className="hidden md:flex gap-1.5">
              {project.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Member avatars */}
          <div className="hidden md:flex items-center">
            {project.members.slice(0, 4).map((m, i) => (
              <img
                key={m.id}
                src={m.user.avatar}
                alt={m.user.username}
                width={26}
                height={26}
                referrerPolicy="no-referrer"
                className="avatar border-2 border-bg"
                style={{
                  width: 26,
                  height: 26,
                  marginLeft: i > 0 ? -8 : 0,
                }}
                title={m.user.name}
              />
            ))}
            {project.members.length > 4 && (
              <div
                className="w-6 h-6 rounded-full bg-surface-2 border-2 border-bg flex items-center justify-center text-[10px] text-ink-dim"
                style={{ marginLeft: -8 }}
              >
                +{project.members.length - 4}
              </div>
            )}
          </div>

          <div className="divider-solid w-px h-5" />

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

          <div className="divider-solid w-px h-5" />

          <button
            onClick={handleLogout}
            className="btn-icon tooltip"
            data-tip="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      {/* Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 p-6 h-full min-h-0">
          {project.columns?.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              projectId={project.id}
              members={project.members}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          projectId={project.id}
          members={project.members}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
