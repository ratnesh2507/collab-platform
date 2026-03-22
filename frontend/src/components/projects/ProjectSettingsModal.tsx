import { useState } from "react";
import { X, Save, Trash2, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUpdateProject, useDeleteProject } from "../../hooks/useProjects";
import type { Project } from "../../types";

type Props = {
  project: Project;
  onClose: () => void;
};

export default function ProjectSettingsModal({ project, onClose }: Props) {
  const { mutateAsync: updateProject, isPending: isUpdating } =
    useUpdateProject();
  const { mutateAsync: deleteProject, isPending: isDeleting } =
    useDeleteProject();
  const navigate = useNavigate();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(project.tags);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasChanges =
    name !== project.name ||
    description !== (project.description ?? "") ||
    JSON.stringify(tags) !== JSON.stringify(project.tags);

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

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    setError("");
    try {
      await updateProject({
        projectId: project.id,
        data: {
          name: name.trim(),
          description: description.trim() || null,
          tags,
        },
      });
      onClose();
    } catch {
      setError("Failed to update project. Try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
      onClose();
      navigate("/dashboard");
    } catch {
      setError("Failed to delete project. Try again.");
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        alignItems: "flex-start",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal fade-in-scale">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0">
              <Settings size={15} className="text-ink-dim" />
            </div>
            <div>
              <h2 className="font-semibold text-[16px] text-ink">
                Project Settings
              </h2>
              <p className="text-[12px] text-ink-dim mt-0.5">
                Edit details or delete this project
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
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

          {/* Danger zone */}
          <div className="card-md p-4 border-danger/20 flex flex-col gap-3">
            <div>
              <p className="text-[13px] font-medium text-ink">Danger Zone</p>
              <p className="text-[12px] text-ink-dim mt-0.5">
                Deleting a project permanently removes all columns, tasks, and
                activity. This cannot be undone.
              </p>
            </div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <p className="text-[12px] text-danger flex-1">
                  Are you sure? This is permanent.
                </p>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="btn btn-secondary btn-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="btn btn-danger btn-xs"
                >
                  {isDeleting ? "Deleting..." : "Yes, delete"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn btn-danger btn-sm w-fit"
              >
                <Trash2 size={13} />
                Delete Project
              </button>
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
              onClick={handleSave}
              disabled={isUpdating || !hasChanges || !name.trim()}
              className="btn btn-primary btn-sm tooltip tooltip-down"
              data-tip={!hasChanges ? "No changes to save" : ""}
            >
              <Save size={14} />
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
