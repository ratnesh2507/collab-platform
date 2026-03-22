import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import type { Project } from "../types";

export type CreateProjectInput = {
  name: string;
  description?: string;
  tags?: string[];
};

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get("/api/projects");
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, CreateProjectInput>({
    mutationFn: async (data: CreateProjectInput) => {
      const res = await api.post("/api/projects", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export type UpdateProjectInput = {
  name?: string;
  description?: string | null;
  tags?: string[];
};

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation<
    Project,
    Error,
    { projectId: string; data: UpdateProjectInput }
  >({
    mutationFn: async ({ projectId, data }) => {
      const res = await api.patch(`/api/projects/${projectId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (projectId: string) => {
      await api.delete(`/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
