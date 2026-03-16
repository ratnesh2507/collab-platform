import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, GitBranch } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

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

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Navbar */}
      <nav className="navbar">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent-dim">
            <GitBranch size={15} color="white" />
          </div>
          <span className="font-semibold text-[15px] text-ink">
            BranchBoard
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {/* Avatar with online dot */}
            <div className="relative w-8 h-8 shrink-0">
              <img
                src={user.avatar}
                alt={user.username}
                width={32}
                height={32}
                className="avatar w-full h-full"
                referrerPolicy="no-referrer"
              />
              <span className="online-dot absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="hidden md:block text-[13px] text-ink-mid">
              {user.username}
            </span>
          </div>

          <div className="divider-solid w-px h-5" />

          <button
            onClick={handleLogout}
            className="btn-icon"
            data-tip="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="page">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-in">
          <div>
            <h1 className="font-bold text-[22px] text-ink">
              Good to see you, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="text-[13px] text-ink-dim mt-1">
              Manage your projects and collaborate with your team
            </p>
          </div>
          <button className="btn btn-primary btn-md">
            <Plus size={15} />
            New Project
          </button>
        </div>

        {/* Empty state */}
        <div className="empty-state fade-in">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 mb-4">
            <GitBranch size={24} className="text-primary" />
          </div>
          <h3 className="font-semibold text-[16px] text-ink-mid mb-2">
            No projects yet
          </h3>
          <p className="text-[13px] text-ink-dim mb-6">
            Create your first project and invite your team to get started
          </p>
          <button className="btn btn-primary btn-md">
            <Plus size={14} />
            Create your first project
          </button>
        </div>
      </div>
    </div>
  );
}
