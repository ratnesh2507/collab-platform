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

  return useMutation<
    Task,
    Error,
    MoveTaskInput,
    { previousBoard: ProjectWithColumns | undefined }
  >({
    mutationFn: async ({ taskId, columnId, order }: MoveTaskInput) => {
      const res = await api.patch(
        `/api/projects/${projectId}/tasks/${taskId}/move`,
        { columnId, order },
      );
      return res.data;
    },

    onMutate: async ({ taskId, columnId, order }) => {
      // 1. Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["board", projectId] });

      // 2. Snapshot the current state so we can roll back on error
      const previousBoard = queryClient.getQueryData<ProjectWithColumns>([
        "board",
        projectId,
      ]);

      // 3. Optimistically reorder the board in the cache
      queryClient.setQueryData<ProjectWithColumns>(
        ["board", projectId],
        (old) => {
          if (!old) return old;

          // Find the task being moved
          let movingTask: Task | undefined;
          const columnsWithoutTask = old.columns.map((col) => ({
            ...col,
            tasks: col.tasks.filter((t) => {
              if (t.id === taskId) {
                movingTask = t;
                return false;
              }
              return true;
            }),
          }));

          if (!movingTask) return old;

          // Insert the task into the target column at the target order
          const updatedColumns = columnsWithoutTask.map((col) => {
            if (col.id !== columnId) return col;
            const newTasks = [...col.tasks];
            newTasks.splice(order, 0, { ...movingTask!, columnId });
            return { ...col, tasks: newTasks };
          });

          return { ...old, columns: updatedColumns };
        },
      );

      // 4. Return snapshot so onError can roll back
      return { previousBoard };
    },

    onError: (_err, _variables, context) => {
      // Roll back to the snapshot
      if (context?.previousBoard) {
        queryClient.setQueryData(["board", projectId], context.previousBoard);
      }
    },
  });
}

export function useBatchDeleteTasks(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string[]>({
    mutationFn: async (taskIds: string[]) => {
      await api.delete(`/api/projects/${projectId}/tasks/batch`, {
        data: { taskIds },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", projectId] });
    },
  });
}
