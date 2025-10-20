"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface MenuItem {
  href: string;
  label: string;
}

const menuItems: MenuItem[] = [
  {
    href: "/technician/dashboard",
    label: "Dashboard",
  },
  {
    href: "/technician/workorders",
    label: "Work Orders",
  },
  {
    href: "/technician/tasks",
    label: "Nhiệm vụ",
  },
  {
    href: "/technician/vehicles",
    label: "Xe đang sửa",
  },
  {
    href: "/technician/tools",
    label: "Dụng cụ",
  },
  {
    href: "/technician/reports",
    label: "Báo cáo",
  },
  {
    href: "/technician/schedule",
    label: "Lịch trình",
  },
];

export default function TechnicianSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
      <div className="p-4">
        {/* Sidebar Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Technician Panel
          </h2>
          <p className="text-sm text-gray-500">Công cụ kỹ thuật viên</p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
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
            <div>Technician Panel v1.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
