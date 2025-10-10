"use client";

import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-8">
        {/* 404 Number */}
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-muted-foreground/30 select-none">
            404
          </h1>
          <div className="w-24 h-1 bg-border mx-auto"></div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Trang không tìm thấy
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đến vị
            trí khác.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <Button className="w-full" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <Button variant="outline" asChild>
            <Link href="/login">
              <LogIn className="w-4 h-4 mr-2" />
              Đăng nhập
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground">
          <p>
            Cần hỗ trợ?{" "}
            <Link href="/contact" className="text-foreground hover:underline">
              Liên hệ với chúng tôi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
