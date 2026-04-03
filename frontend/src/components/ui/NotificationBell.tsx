import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  useNotifications,
  useMarkAllRead,
  useMarkRead,
  type Notification,
} from "../../hooks/useNotifications";
import { getSocket } from "../../lib/socket";
import { useQueryClient } from "@tanstack/react-query";

export default function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const { mutate: markAllRead } = useMarkAllRead();
  const { mutate: markRead } = useMarkRead();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    const socket = getSocket();

    const handleNotification = (notification: Notification) => {
      // Instantly prepend the new notification to the cache — no refetch needed
      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (old = []) => [notification, ...old],
      );
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [queryClient]);

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="btn-icon relative tooltip tooltip-down"
        data-tip="Notifications"
      >
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="notification-dropdown fade-in-scale">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[13px] text-ink">
                Notifications
              </span>
              {unread > 0 && (
                <span className="badge badge-danger text-[10px]">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={() => markAllRead()}
                className="flex items-center gap-1 text-[11px] text-ink-dim hover:text-primary transition-colors"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center mb-1">
                  <Bell size={16} className="text-ink-ghost" />
                </div>
                <p className="text-[12px] text-ink-dim font-medium">
                  No notifications
                </p>
                <p className="text-[11px] text-ink-ghost">
                  You'll be notified when tasks are assigned to you
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n: Notification) => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                      !n.read
                        ? "bg-primary/5 hover:bg-primary/10 cursor-pointer"
                        : "cursor-default"
                    }`}
                  >
                    {/* Unread dot — only show for unread */}
                    {!n.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}

                    <div className={`flex-1 min-w-0 ${n.read ? "pl-2.5" : ""}`}>
                      <p className="text-[12px] text-ink-mid leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-ink-ghost mt-0.5">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
