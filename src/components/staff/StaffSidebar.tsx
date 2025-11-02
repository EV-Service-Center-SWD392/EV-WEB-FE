"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  UserCheck,
  Wrench,
  BarChart3,
  ChevronRight,
  Receipt,
  CreditCard,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  {
    href: "/staff/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/staff/intake",
    label: "Quản lý phiếu tiếp nhận",
    icon: FileText,
  },
  {
    href: "/staff/schedules",
    label: "Schedules",
    icon: Calendar,
  },
  {
    href: "/staff/receipt",
    label: "Hóa đơn",
    icon: Receipt,
  },
  {
    href: "/staff/payment",
    label: "Giao dịch",
    icon: CreditCard,
  },
  {
    href: "/staff/create-payment",
    label: "Tạo giao dịch",
    icon: Plus,
  },
  {
    href: "/staff/workorders",
    label: "Work Orders",
    icon: Wrench,
  },
  {
    href: "/staff/technicians",
    label: "Technicians",
    icon: UserCheck,
  },
  {
    href: "/staff/customers",
    label: "Customers",
    icon: Users,
  },
  {
    href: "/staff/services",
    label: "Services",
    icon: Wrench,
  },
  {
    href: "/staff/reports",
    label: "Reports",
    icon: BarChart3,
  },
];

export default function StaffSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
        {/* Sidebar Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                EV
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">
                Staff Panel
              </h2>
              <p className="text-xs text-muted-foreground">
                Service Operations
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent/50",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="font-medium text-foreground">EV Service Center</div>
            <div>Staff Panel v2.0</div>
            <div className="text-[10px] opacity-75">Modern UI Design</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
