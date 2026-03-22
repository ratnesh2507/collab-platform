import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null | undefined; // undefined = not yet fetched, null = not logged in
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: undefined, // undefined means "not yet fetched"
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, isLoading: false }),
}));
