"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface MenuItem {
  href: string;
  label: string;
}

const menuItems: MenuItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
  },
  {
    href: "/admin/manager-users",
    label: "Manager Users",
  },
  {
    href: "/admin/manager-bookings",
    label: "Manager Bookings",
  },
  {
    href: "/admin/manager-inventory",
    label: "Manager Inventory",
  },
  {
    href: "/admin/manager-revenue",
    label: "Manager Revenue",
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

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
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
