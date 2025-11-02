"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StaffNavbar from "@/components/staff/StaffNavbar";
import StaffSidebar from "@/components/staff/StaffSidebar";
import ChatBotWidget from "@/components/chatbot/ChatBotWidget";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role.toLocaleLowerCase() !== "staff")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || user.role.toLocaleLowerCase() !== "staff") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Staff Navbar */}
      <StaffNavbar />

      <div className="flex">
        {/* Staff Sidebar */}
        <StaffSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 bg-background">{children}</main>
      </div>

      {/* ChatBot widget (floating) */}
      <ChatBotWidget />
    </div>
  );
}
