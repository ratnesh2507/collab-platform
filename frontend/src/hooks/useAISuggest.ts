import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";
import type { AISuggestion } from "../types";

export function useAISuggest(projectId: string, taskId: string) {
  return useMutation<AISuggestion, Error>({
    mutationFn: async () => {
      const res = await api.post(
        `/api/projects/${projectId}/tasks/${taskId}/ai-suggest`,
      );
      return res.data;
    },
  });
}
