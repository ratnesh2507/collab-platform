import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, GitBranch } from "lucide-react";
import type { Project } from "../../types";

type Props = {
  project: Project;
};

const FRONTEND_URL = import.meta.env.VITE_APP_URL || "http://localhost:5173";

// Generate a consistent accent color per project based on name
const projectColors = [
  { bg: "bg-primary/10", border: "border-primary/20", icon: "text-primary" },
  { bg: "bg-accent/10", border: "border-accent/20", icon: "text-accent" },
  { bg: "bg-success/10", border: "border-success/20", icon: "text-success" },
  { bg: "bg-warning/10", border: "border-warning/20", icon: "text-warning" },
  { bg: "bg-info/10", border: "border-info/20", icon: "text-info" },
];

function getProjectColor(name: string) {
  const index = name.charCodeAt(0) % projectColors.length;
  return projectColors[index];
}

export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const color = getProjectColor(project.name);

  const handleCopyInvite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const inviteUrl = `${FRONTEND_URL}/invite/${project.inviteToken}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="card-interactive p-5 flex flex-col gap-4 cursor-pointer"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg ${color.bg} border ${color.border} flex items-center justify-center shrink-0`}
          >
            <GitBranch size={16} className={color.icon} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[14px] text-ink leading-snug truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-[12px] text-ink-dim mt-0.5 line-clamp-1">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Copy invite link */}
        <button
          onClick={handleCopyInvite}
          className={`btn-icon tooltip tooltip-down shrink-0 ${copied ? "text-success" : ""}`}
          data-tip={copied ? "Copied!" : "Copy invite link"}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-7">
          {project.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        {/* Stacked member avatars */}
        <div className="flex items-center">
          {project.members?.slice(0, 4).map((m, i) => (
            <img
              key={m.id}
              src={m.user.avatar}
              alt={m.user.username}
              width={22}
              height={22}
              referrerPolicy="no-referrer"
              className="avatar border-2 border-surface w-5.5 h-5.5"
              style={{ marginLeft: i > 0 ? -8 : 0 }}
              title={m.user.name}
            />
          ))}
          {(project.members?.length ?? 0) > 4 && (
            <div
              className="w-5.5 h-5.5 rounded-full bg-surface-3 border-2 border-surface flex items-center justify-center text-[9px] text-ink-dim"
              style={{ marginLeft: -8 }}
            >
              +{project.members.length - 4}
            </div>
          )}
        </div>

        <span className="text-[11px] text-ink-ghost">
          {new Date(project.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
