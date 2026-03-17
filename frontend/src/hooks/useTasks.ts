import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import type { ProjectWithColumns } from "../types";

export function useBoard(projectId: string) {
  return useQuery<ProjectWithColumns>({
    queryKey: ["board", projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      columnId: string;
      assigneeId?: string;
    }) => {
      const res = await api.post(`/api/projects/${projectId}/tasks`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", projectId] });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data: {
        title?: string;
        description?: string | null;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        assigneeId?: string | null;
      };
    }) => {
      const res = await api.patch(
        `/api/projects/${projectId}/tasks/${taskId}`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", projectId] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", projectId] });
    },
  });
}

export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      columnId,
      order,
    }: {
      taskId: string;
      columnId: string;
      order: number;
    }) => {
      const res = await api.patch(
        `/api/projects/${projectId}/tasks/${taskId}/move`,
        { columnId, order },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", projectId] });
    },
  });
}
