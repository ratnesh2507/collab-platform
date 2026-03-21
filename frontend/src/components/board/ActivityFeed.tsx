import { X } from "lucide-react";
import { useActivity } from "../../hooks/useNotifications";

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
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-surface border-l border-border flex flex-col h-full slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-[15px] text-ink">Activity</h2>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="skeleton w-7 h-7 rounded-full shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="skeleton h-3 w-3/4" />
                    <div className="skeleton h-2.5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 pb-10">
              <p className="text-[13px] text-ink-ghost">No activity yet</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {activity.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-5 py-3.5"
                >
                  <img
                    src={item.user.avatar}
                    alt={item.user.username}
                    width={28}
                    height={28}
                    referrerPolicy="no-referrer"
                    className="avatar shrink-0"
                    style={{ width: 28, height: 28 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-ink-mid leading-snug">
                      <span className="font-medium text-ink">
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
