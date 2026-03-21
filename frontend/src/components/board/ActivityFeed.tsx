import { X } from "lucide-react";
import { useActivity, type ActivityItem } from "../../hooks/useNotifications";

type Props = {
  projectId: string;
  onClose: () => void;
};

export default function ActivityFeed({ projectId, onClose }: Props) {
  const { data: activity = [], isLoading } = useActivity(projectId);

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — rounded + inset margin */}
      <div className="side-panel slide-in-right w-95 rounded-l-2xl my-3 mr-3">
        {/* Header */}
        <div className="side-panel-header rounded-tl-2xl">
          <div>
            <h2 className="font-semibold text-[15px] text-ink">Activity</h2>
            <p className="text-[12px] text-ink-dim mt-0.5">
              Recent project events
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Feed */}
        <div className="side-panel-body px-3 py-3">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card-md p-3 flex gap-3 items-start">
                  <div className="skeleton w-7 h-7 rounded-full shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="skeleton h-3 w-3/4" />
                    <div className="skeleton h-2.5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="card-md flex flex-col items-center justify-center py-12 gap-2 text-center">
              <p className="text-[13px] text-ink-dim">No activity yet</p>
              <p className="text-[12px] text-ink-ghost">
                Actions like creating and moving tasks will appear here
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(activity as ActivityItem[]).map((item) => (
                <div
                  key={item.id}
                  className="card-md p-3 flex items-start gap-3"
                >
                  <img
                    src={item.user.avatar}
                    alt={item.user.username}
                    width={28}
                    height={28}
                    referrerPolicy="no-referrer"
                    className="avatar w-7 h-7 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-ink-mid leading-snug">
                      <span className="font-semibold text-ink">
                        {item.user.name}
                      </span>{" "}
                      {item.action}
                    </p>
                    <p className="text-[11px] text-ink-ghost mt-0.5">
                      {timeAgo(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
