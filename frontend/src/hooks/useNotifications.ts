import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  createdAt: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
}

const NOTIFICATION_POLL_INTERVAL = 30_000; // 30s fallback poll

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/api/notifications");
      return res.data;
    },
    staleTime: 10_000,
    refetchInterval: NOTIFICATION_POLL_INTERVAL,
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.patch("/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useActivity(projectId: string) {
  return useQuery<ActivityItem[]>({
    queryKey: ["activity", projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/activity`);
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 15_000,
  });
}
