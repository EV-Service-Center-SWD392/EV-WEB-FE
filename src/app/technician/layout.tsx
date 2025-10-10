"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TechnicianNavbar from "@/components/technician/TechnicianNavbar";
import TechnicianSidebar from "@/components/technician/TechnicianSidebar";

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "technician")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || user.role !== "technician") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Technician Navbar */}
      <TechnicianNavbar />

      <div className="flex">
        {/* Technician Sidebar */}
        <TechnicianSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
