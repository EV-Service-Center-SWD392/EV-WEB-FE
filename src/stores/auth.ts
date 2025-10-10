import { create } from "zustand";

import type { User } from "@/services/auth";

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  setAuth: (_user: User, _token: string | null) => void;
  logout: () => void;
  clear: () => void;
  initialize: () => void;
  setLoading: (_loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("access_token", token);
        localStorage.setItem("auth_token", token); // For mock API
        // Also set as cookie for middleware
        document.cookie = `access_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_token");
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    }
    set({ user, token, isInitialized: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_token"); // For mock API
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    set({ user: null, token: null, isInitialized: true });
  },

  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_token"); // For mock API
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    set({ user: null, token: null, isInitialized: true });
  },

  initialize: () => {
    if (typeof window !== "undefined" && !get().isInitialized) {
      const token = localStorage.getItem("access_token");
      if (token) {
        // Set cookie from localStorage for middleware
        document.cookie = `access_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        set({ token, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    }
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
