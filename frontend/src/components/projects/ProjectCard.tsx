import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Users, GitBranch } from "lucide-react";
import type { Project } from "../../types";

type Props = {
  project: Project;
};

const FRONTEND_URL = import.meta.env.VITE_APP_URL || "http://localhost:5173";

export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <GitBranch size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-[14px] text-ink leading-snug">
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
          className={`btn-icon tooltip shrink-0 ${copied ? "text-success" : ""}`}
          data-tip={copied ? "Copied!" : "Copy invite link"}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="flex items-center gap-1.5 text-[12px] text-ink-dim">
          <Users size={12} />
          <span>
            {project.members?.length ?? 1} member
            {(project.members?.length ?? 1) !== 1 ? "s" : ""}
          </span>
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
