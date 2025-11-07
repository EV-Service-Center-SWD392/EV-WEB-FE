"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  TrendingUp,
  UserCog,
  Award,
  UserCheck,
  LucideIcon
} from "lucide-react";

import { cn } from "@/lib/utils";

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface MenuGroup {
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
}

type MenuItemOrGroup = MenuItem | MenuGroup;

function isMenuGroup(item: MenuItemOrGroup): item is MenuGroup {
  return "items" in item;
}

const menuItems: MenuItemOrGroup[] = [
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
    label: "Quản lý Technician",
    icon: UserCog,
    items: [
      {
        href: "/admin/technician-schedule",
        label: "Quản lý lịch technicians",
        icon: Calendar,
      },
      {
        href: "/admin/technician-list",
        label: "Technicians & Chứng chỉ",
        icon: UserCheck,
      },
    ],
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
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    new Set(["Quản lý Technician"])
  );

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const isItemActive = (href: string) => pathname === href;
  const isGroupActive = (items: MenuItem[]) => {
    return items.some((item) => pathname === item.href);
  };

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
            if (isMenuGroup(item)) {
              const isExpanded = expandedGroups.has(item.label);
              const hasActiveItem = isGroupActive(item.items);
              const Icon = item.icon;

              return (
                <div key={item.label} className="space-y-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      hasActiveItem
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    <svg
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded ? "rotate-90" : ""
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Group Items */}
                  {isExpanded && (
                    <div className="ml-6 space-y-1">
                      {item.items.map((subItem) => {
                        const isActive = isItemActive(subItem.href);
                        const SubIcon = subItem.icon;

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                              isActive
                                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            <SubIcon className="h-4 w-4" />
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Single menu item
            const isActive = isItemActive(item.href);
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
