import { create } from "zustand";
import * as authApi from "../api/auth";
import type { User } from "../types";

type AuthState = {
  user: User | null;
  bootstrapped: boolean;
  setToken: (token: string | null) => void;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  bootstrapped: false,
  setToken: (token) => {
    if (token) localStorage.setItem("access_token", token);
    else localStorage.removeItem("access_token");
  },
  bootstrap: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ user: null, bootstrapped: true });
      return;
    }
    try {
      const user = await authApi.fetchMe();
      set({ user, bootstrapped: true });
    } catch {
      localStorage.removeItem("access_token");
      set({ user: null, bootstrapped: true });
    }
  },
  login: async (email, password) => {
    const res = await authApi.login(email, password);
    get().setToken(res.access_token);
    const user = await authApi.fetchMe();
    set({ user });
  },
  register: async (email, password) => {
    const res = await authApi.register(email, password);
    get().setToken(res.access_token);
    const user = await authApi.fetchMe();
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("access_token");
    set({ user: null });
  },
}));
