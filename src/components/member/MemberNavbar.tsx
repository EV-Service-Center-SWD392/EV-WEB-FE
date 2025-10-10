"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

export default function MemberNavbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/member/dashboard" className="text-xl font-semibold text-gray-900">
            EV Service Center
          </Link>
          <Badge variant="secondary" className="text-xs">
            MEMBER
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-100 text-gray-600">
                {user?.name?.charAt(0).toUpperCase() || 'M'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {user?.name || 'Member'}
              </span>
              <span className="text-xs text-gray-500">
                {user?.email}
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}