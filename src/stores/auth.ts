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
        // Persist user for fast restore on reload
        try {
          localStorage.setItem("user", JSON.stringify(user));
        } catch {
          // ignore
        }
        // Also set as cookie for middleware
        document.cookie = `access_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
        try {
          // store user as URL-encoded JSON in a cookie so middleware (server) can read role
          document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${7 * 24 * 60 * 60}`;
        } catch {
          // ignore cookie write errors
        }
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // remove user cookie as well
        document.cookie =
          "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    }
    set({ user, token, isInitialized: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_token"); // For mock API
      localStorage.removeItem("user");
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      // also remove the user cookie so middleware doesn't read stale role
      document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    set({ user: null, token: null, isInitialized: true });
  },

  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_token"); // For mock API
      localStorage.removeItem("user");
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      // also remove the user cookie
      document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    set({ user: null, token: null, isInitialized: true });
  },

  initialize: () => {
    if (typeof window !== "undefined" && !get().isInitialized) {
      const token = localStorage.getItem("access_token");
      const userRaw = localStorage.getItem("user");
      // If we have a persisted user, restore it immediately for a snappy UI
      if (userRaw) {
        try {
          const parsed = JSON.parse(userRaw) as unknown;
          // Basic shape check
          if (parsed && typeof parsed === "object") {
            set({
              user: parsed as unknown as User,
              token: token,
              isInitialized: true,
            });
            return;
          }
        } catch {
          // ignore parse errors and fall back to token-only init
        }
      }
      if (token) {
        // Set cookie from localStorage for middleware
        document.cookie = `access_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        // restore user cookie if we have a persisted user
        if (userRaw) {
          try {
            document.cookie = `user=${encodeURIComponent(userRaw)}; path=/; max-age=${7 * 24 * 60 * 60}`;
          } catch {}
        }
        set({ token, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    }
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
