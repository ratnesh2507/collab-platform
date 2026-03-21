import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProjects } from "../hooks/useProjects";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, GitBranch } from "lucide-react";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import ProjectCard from "../components/projects/ProjectCard";
import NotificationBell from "../components/ui/NotificationBell";
import { connectSocket } from "../lib/socket";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user?.id) connectSocket(user.id);
  }, [user?.id]);
  const handleLogout = async () => {
    await api.post("/api/auth/logout");
    window.location.href = "/";
  };

  if (authLoading) {
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
          <NotificationBell />
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

      {/* Main content */}
      <div className="page">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-in">
          <div>
            <h1 className="font-bold text-[22px] text-ink">
              Good to see you, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="text-[13px] text-ink-dim mt-1">
              {projects?.length
                ? `You have ${projects.length} project${projects.length !== 1 ? "s" : ""}`
                : "Manage your projects and collaborate with your team"}
            </p>
          </div>
          <button
            className="btn btn-primary btn-md"
            onClick={() => setShowModal(true)}
          >
            <Plus size={15} />
            New Project
          </button>
        </div>

        {/* Projects grid */}
        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 flex flex-col gap-4">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="empty-state fade-in">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 mb-4">
              <GitBranch size={24} className="text-primary" />
            </div>
            <h3 className="font-semibold text-[15px] text-ink-mid mb-2">
              No projects yet
            </h3>
            <p className="text-[13px] text-ink-dim mb-5">
              Create your first project and invite your team to get started
            </p>
            <button
              className="btn btn-primary btn-md"
              onClick={() => setShowModal(true)}
            >
              <Plus size={14} />
              Create your first project
            </button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
