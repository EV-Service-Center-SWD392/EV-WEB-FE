"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth";

export default function HeroSection() {
  const { user } = useAuthStore();

  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <Badge variant="secondary" className="mb-4">
          Dịch vụ xe điện hàng đầu
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          Trung tâm bảo dưỡng <span className="text-primary">xe điện</span> tiên
          tiến
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Nơi công nghệ AI gặp gỡ sự chăm sóc tận tâm. Chúng tôi mang đến dịch
          vụ bảo dưỡng xe điện chuyên nghiệp với đội ngũ kỹ thuật viên giàu kinh
          nghiệm.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          {!user ? (
            <>
              <Button asChild size="lg">
                <Link href="/register">Đăng ký ngay</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Đăng nhập</Link>
              </Button>
            </>
          ) : user.role.toLocaleLowerCase() === "customer" ? (
            <>
              <Button asChild size="lg">
                <Link href="/member/dashboard">Vào Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#services">Đặt lịch dịch vụ</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href={`/${user.role}/dashboard`}>Vào Workspace</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#services">Xem dịch vụ</Link>
              </Button>
            </>
          )}
        </div>

        {user && (
          <div className="mt-12 p-6 bg-muted rounded-lg border max-w-md mx-auto">
            <p className="text-sm text-muted-foreground">
              Xin chào,{" "}
              <span className="font-semibold text-foreground">{user.name}</span>
              !
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Chào mừng bạn quay trở lại với dịch vụ của chúng tôi.
            </p>
          </div>
        )}

        {/* Simple visual element */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold mb-2">Công nghệ AI</h3>
            <p className="text-sm text-muted-foreground">
              Chẩn đoán thông minh và chính xác
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔧</span>
            </div>
            <h3 className="font-semibold mb-2">Kỹ thuật viên</h3>
            <p className="text-sm text-muted-foreground">
              Đội ngũ chuyên nghiệp giàu kinh nghiệm
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚗</span>
            </div>
            <h3 className="font-semibold mb-2">Dịch vụ 24/7</h3>
            <p className="text-sm text-muted-foreground">
              Hỗ trợ khách hàng mọi lúc mọi nơi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
