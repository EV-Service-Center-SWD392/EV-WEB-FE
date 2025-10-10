"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStaff: 0,
    totalTechnicians: 0,
    totalMembers: 0,
    totalBookings: 0,
    revenue: 0,
    completedJobs: 0,
    pendingJobs: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setStats({
        totalUsers: 127,
        totalStaff: 8,
        totalTechnicians: 15,
        totalMembers: 104,
        totalBookings: 89,
        revenue: 45620000,
        completedJobs: 234,
        pendingJobs: 12,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">
            Quản lý toàn bộ hệ thống EV Service Center
          </p>
        </div>
        <Button variant="outline">Xuất báo cáo</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.totalUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">+12% từ tháng trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading
                ? "..."
                : `${(stats.revenue / 1000000).toFixed(1)}M VND`}
            </div>
            <p className="text-xs text-gray-500 mt-1">+24% từ tháng trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Công việc hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.completedJobs}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pendingJobs} đang chờ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Lịch hẹn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.totalBookings}
            </div>
            <p className="text-xs text-gray-500 mt-1">+18% từ tháng trước</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nhân sự</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Staff</span>
              <span className="font-semibold">{stats.totalStaff}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Technicians</span>
              <span className="font-semibold">{stats.totalTechnicians}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Khách hàng</span>
              <span className="font-semibold">{stats.totalMembers}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trạng thái hệ thống</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Server</span>
              <span className="text-sm text-green-600 font-medium">
                Hoạt động tốt
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm text-green-600 font-medium">
                Kết nối ổn định
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API</span>
              <span className="text-sm text-yellow-600 font-medium">
                99.9% uptime
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông báo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-700">3 lịch hẹn cần duyệt</div>
            <div className="text-sm text-gray-700">Kho thiếu 2 phụ tùng</div>
            <div className="text-sm text-gray-700">5 báo cáo mới</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Tạo tài khoản mới
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Quản lý Booking
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Xem báo cáo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-sm font-medium">
                Nguyễn Văn A đăng ký thành công
              </p>
              <p className="text-xs text-gray-500">2 phút trước</p>
            </div>
            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-sm font-medium">
                Kỹ thuật viên cập nhật tiến độ
              </p>
              <p className="text-xs text-gray-500">5 phút trước</p>
            </div>
            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-sm font-medium">Booking ID #1234 được tạo</p>
              <p className="text-xs text-gray-500">10 phút trước</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
