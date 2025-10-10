"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/stores/auth";
import { me } from "@/services/auth";
import { LoadingPage } from "@/components/ui/LoadingSpinner";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user, isInitialized, setAuth, clear, initialize, setLoading } =
    useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage
    initialize();
  }, [initialize]);

  useEffect(() => {
    // If we have a token but no user, fetch user data
    if (isInitialized && token && !user) {
      setLoading(true);
      me()
        .then((userData) => {
          setAuth(userData, token);
        })
        .catch(() => {
          // Token is invalid, clear auth state
          clear();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isInitialized, token, user, setAuth, clear, setLoading]);

  // Show loading while initializing auth
  if (!isInitialized) {
    return <LoadingPage message="Đang khởi tạo..." />;
  }

  return <>{children}</>;
}
