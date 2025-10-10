"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import MemberNavbar from "@/components/member/MemberNavbar";
import MemberSidebar from "@/components/member/MemberSidebar";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "member")) {
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

  if (!user || user.role !== "member") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberNavbar />
      <div className="flex">
        <MemberSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}