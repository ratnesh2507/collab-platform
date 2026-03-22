import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import type { ProjectWithColumns, Task, TaskPriority } from "../types";

export type CreateTaskInput = {
  title: string;
  description?: string;
  priority: TaskPriority;
  columnId: string;
  assigneeId?: string;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  assigneeId?: string | null;
};

export type MoveTaskInput = {
  taskId: string;
  columnId: string;
  order: number;
};

export function useBoard(projectId: string) {
  return useQuery<ProjectWithColumns>({
    queryKey: ["board", projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 10_000,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, CreateTaskInput>({
    mutationFn: async (data: CreateTaskInput) => {
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
  return useMutation<Task, Error, { taskId: string; data: UpdateTaskInput }>({
    mutationFn: async ({ taskId, data }) => {
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
  return useMutation<void, Error, string>({
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
  return useMutation<Task, Error, MoveTaskInput>({
    mutationFn: async ({ taskId, columnId, order }: MoveTaskInput) => {
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
