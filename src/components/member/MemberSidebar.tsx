"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Car, 
  Calendar, 
  FileText, 
  User, 
  CreditCard, 
  Settings, 
  History,
  Wrench,
  Home
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/member/dashboard', 
    icon: Home 
  },
  { 
    name: 'Xe của tôi', 
    href: '/member/vehicles', 
    icon: Car 
  },
  { 
    name: 'Đặt lịch', 
    href: '/member/bookings', 
    icon: Calendar 
  },
  { 
    name: 'Lịch sử dịch vụ', 
    href: '/member/service-history', 
    icon: History 
  },
  { 
    name: 'Hóa đơn', 
    href: '/member/invoices', 
    icon: FileText 
  },
  { 
    name: 'Thanh toán', 
    href: '/member/payments', 
    icon: CreditCard 
  },
  { 
    name: 'Hồ sơ', 
    href: '/member/profile', 
    icon: User 
  },
  { 
    name: 'Cài đặt', 
    href: '/member/settings', 
    icon: Settings 
  },
];

export default function MemberSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-50 h-full border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Khu vực khách hàng
        </h2>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-8 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <Wrench className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Cần hỗ trợ?
            </p>
            <p className="text-xs text-blue-700">
              Liên hệ: 1900-xxxx
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}