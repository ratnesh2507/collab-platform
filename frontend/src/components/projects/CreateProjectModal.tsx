import { useState } from "react";
import { X, Plus, GitBranch } from "lucide-react";
import { useCreateProject } from "../../hooks/useProjects";
import { useNavigate } from "react-router-dom";

type Props = {
  onClose: () => void;
};

export default function CreateProjectModal({ onClose }: Props) {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    setError("");
    try {
      const project = await mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        tags,
      });
      onClose();
      navigate(`/projects/${project.id}`);
    } catch {
      setError("Failed to create project. Try again.");
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal fade-in-scale">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <GitBranch size={15} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-[16px] text-ink">
                New Project
              </h2>
              <p className="text-[12px] text-ink-dim mt-0.5">
                Create a project and invite your team
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body flex flex-col gap-5">
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              className="input"
              placeholder="e.g. BranchBoard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={50}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <div className="flex items-center justify-between">
              <label className="form-label">Tags</label>
              <span className="form-hint">{tags.length}/5</span>
            </div>
            <input
              className="input"
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              disabled={tags.length >= 5}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span key={tag} className="tag flex items-center gap-1.5">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="p-0.5 text-ink-ghost hover:text-ink-dim transition-colors rounded"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer flex-col items-stretch gap-3">
          {error && <p className="form-error text-center">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
              className="btn btn-primary btn-sm"
            >
              <Plus size={14} />
              {isPending ? "Creating..." : "Create Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
