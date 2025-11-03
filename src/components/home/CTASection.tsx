"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

export default function CTASection() {
  const { user } = useAuthStore();

  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          {!user ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Sẵn sàng bắt đầu?
              </h2>
              <p className="text-lg text-muted-foreground">
                Đăng ký ngay hôm nay để trải nghiệm dịch vụ tốt nhất cho xe điện
                của bạn
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg">
                  <Link href="/register">Đăng ký miễn phí</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Đã có tài khoản</Link>
                </Button>
              </div>
            </>
          ) : user.role === "member" ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Quản lý xe điện của bạn
              </h2>
              <p className="text-lg text-muted-foreground">
                Theo dõi tình trạng xe, đặt lịch bảo trì và nhận ưu đãi độc
                quyền
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg">
                  <Link href="/member/dashboard">Vào Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/member/appointments">Đặt lịch bảo trì</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Workspace của bạn
              </h2>
              <p className="text-lg text-muted-foreground">
                Quản lý công việc và theo dõi hiệu suất từ dashboard chuyên
                nghiệp
              </p>
              <Button asChild size="lg" className="mt-4">
                <Link href={`/${user.role}/dashboard`}>Về Dashboard</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
