import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GitBranch, LogOut, ArrowLeft } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function Board() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/api/projects/${projectId}`);
        setProject(res.data);
      } catch {
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId]);

  const handleLogout = async () => {
    await api.post("/api/auth/logout");
    window.location.href = "/";
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-bg">
      {/* Navbar */}
      <nav className="navbar">
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
            {project?.name ?? "Project"}
          </span>
          {project?.tags?.length > 0 && (
            <div className="hidden md:flex gap-1.5">
              {project.tags.map((tag: string) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
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

      {/* Board placeholder */}
      <div className="page">
        <div className="empty-state fade-in">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 mb-4">
            <GitBranch size={24} className="text-primary" />
          </div>
          <h3 className="font-semibold text-[15px] text-ink-mid mb-2">
            Kanban board coming soon
          </h3>
          <p className="text-[13px] text-ink-dim mb-2">
            {project?.columns?.length} columns ready — Backlog, In Progress, In
            Review, Done
          </p>
          <p className="text-[12px] text-ink-ghost">
            Phase 3 — drag & drop board is next
          </p>
        </div>
      </div>
    </div>
  );
}
