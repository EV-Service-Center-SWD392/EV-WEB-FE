"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  TrendingUp,
  LucideIcon
} from "lucide-react";

import { cn } from "@/lib/utils";

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/manager-users",
    label: "Quản lý người dùng",
    icon: Users,
  },
  {
    href: "/admin/manager-bookings",
    label: "Quản lý đặt lịch",
    icon: Calendar,
  },
  {
    href: "/admin/technician-schedule",
    label: "Quản lý lịch Technician",
    icon: Calendar,
  },
  {
    href: "/admin/sparepart-management",
    label: "Quản lý phụ tùng",
    icon: Settings,
  },
  {
    href: "/admin/manager-revenue",
    label: "Quản lý doanh thu",
    icon: TrendingUp,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* Sidebar Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Admin Panel
          </h2>
          <p className="text-sm text-gray-500">Quản trị hệ thống</p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div>EV Service Center</div>
            <div>Admin Panel v1.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
