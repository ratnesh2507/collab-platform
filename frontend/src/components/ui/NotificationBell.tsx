import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
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
    socket.on("notification", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
    return () => {
      socket.off("notification");
    };
  }, []);

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
        className="btn-icon relative tooltip"
        data-tip="Notifications"
      >
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 card shadow-lg z-50 fade-in-scale">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-[13px] text-ink">
              Notifications
              {unread > 0 && (
                <span className="ml-2 badge badge-danger text-[10px]">
                  {unread} new
                </span>
              )}
            </span>
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
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Bell size={20} className="text-ink-ghost" />
                <p className="text-[12px] text-ink-ghost">No notifications</p>
              </div>
            ) : (
              notifications.map((n: Notification) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border cursor-pointer transition-colors hover:bg-surface-2 ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-primary" : "bg-transparent"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-ink-mid leading-snug">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-ink-ghost mt-0.5">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <Check size={12} className="text-primary shrink-0 mt-0.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
