"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth";

export default function SignOutPage() {
  const { logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Tự động đăng xuất khi vào trang này
    logout();

    // Redirect về home sau 3 giây
    const timeout = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [logout, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Đăng xuất thành công</CardTitle>
          <CardDescription>
            Bạn đã đăng xuất khỏi EV Service Center. Cảm ơn bạn đã sử dụng dịch
            vụ!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-muted-foreground text-sm">
            Đang chuyển hướng về trang chủ trong 3 giây...
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/">Về trang chủ</Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Đăng nhập lại</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
