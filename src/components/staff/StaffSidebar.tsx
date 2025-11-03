"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CalendarClock,
  Users,
  UserCheck,
  Wrench,
  BarChart3,
  ChevronRight,
  ChevronDown,
  PlusSquare,
  Receipt,
  CreditCard,
  Plus,
  ClipboardCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

type MenuItemOrGroup = MenuItem | MenuGroup;

function isMenuGroup(item: MenuItemOrGroup): item is MenuGroup {
  return "items" in item;
}

const menuItems: MenuItemOrGroup[] = [
  {
    href: "/staff/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Lịch & Phân công",
    icon: CalendarClock,
    items: [
      { href: "/staff/assignments", label: "Phân công đã giao", icon: UserCheck },
      { href: "/staff/booking-assignment", label: "Booking Assignment", icon: ClipboardCheck },
      { href: "/staff/technician-schedule", label: "Lịch Technician", icon: CalendarClock },
      { href: "/staff/workorders", label: "Work Orders", icon: Wrench },
    ],
  },
  {
    label: "Service & Intake",
    icon: FileText,
    items: [
      { href: "/staff/intake-list", label: "Danh sách Intakes", icon: FileText },
      { href: "/staff/intake/new", label: "Tạo Intake mới", icon: PlusSquare },
    ],
  },
  {
    label: "Giao dịch & Tài chính",
    icon: CreditCard,
    items: [
      { href: "/staff/receipt", label: "Hóa đơn", icon: Receipt },
      { href: "/staff/payment", label: "Giao dịch", icon: CreditCard },
      { href: "/staff/create-payment", label: "Tạo giao dịch", icon: Plus },
    ],
  },
  {
<<<<<<< HEAD
    href: "/staff/create-payment",
    label: "Tạo giao dịch",
    icon: Plus,
  },
  {
    href: "/technician-schedule",
    label: "Quản lý lịch Technician",
    icon: Calendar,
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
=======
    label: "Danh bạ",
>>>>>>> origin/devBranch
    icon: Users,
    items: [
      { href: "/staff/technicians", label: "Technicians", icon: UserCheck },
      { href: "/staff/customers", label: "Customers", icon: Users },
      { href: "/staff/services", label: "Services", icon: Wrench },
    ],
  },
  {
    href: "/staff/reports",
    label: "Reports",
    icon: BarChart3,
  },
];

export default function StaffSidebar() {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    () => {
      // Load from localStorage
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("staff-sidebar-expanded");
        if (saved) {
          return new Set(JSON.parse(saved));
        }
      }
      // Default: expand "Lịch & Phân công"
      return new Set(["Lịch & Phân công"]);
    }
  );

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("staff-sidebar-expanded", JSON.stringify([...newSet]));
      }
      return newSet;
    });
  };

  const isItemActive = (href: string) => pathname === href;

  const isGroupActive = (items: MenuItem[]) => {
    return items.some((item) => pathname === item.href);
  };

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
                      "w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent/50",
                      hasActiveItem
                        ? "bg-primary/5 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          hasActiveItem
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded ? "transform rotate-180" : "",
                        hasActiveItem ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </button>

                  {/* Group Items */}
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="ml-4 space-y-1 py-1 border-l-2 border-border/50 pl-2">
                      {item.items.map((subItem) => {
                        const isActive = isItemActive(subItem.href);
                        const SubIcon = subItem.icon;

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-accent/50",
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <SubIcon
                                className={cn(
                                  "h-3.5 w-3.5 transition-colors",
                                  isActive
                                    ? "text-primary"
                                    : "text-muted-foreground/70 group-hover:text-foreground"
                                )}
                              />
                              <span className="text-xs">{subItem.label}</span>
                            </div>
                            {isActive && (
                              <ChevronRight className="h-3 w-3 text-primary" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Single menu item (not a group)
            const isActive = isItemActive(item.href);
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
