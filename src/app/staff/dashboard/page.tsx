"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StaffDashboard() {
  const [stats, setStats] = useState({
    totalTechnicians: 0,
    activeTechnicians: 0,
    pendingTasks: 0,
    completedToday: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real data from API
    setTimeout(() => {
      setStats({
        totalTechnicians: 15,
        activeTechnicians: 12,
        pendingTasks: 8,
        completedToday: 23,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Staff</h1>
          <p className="text-gray-600 mt-1">
            Quản lý Technicians và lịch làm việc
          </p>
        </div>
        <Button variant="outline">Xuất báo cáo</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng Technicians
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.totalTechnicians}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kỹ thuật viên trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Đang hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.activeTechnicians}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Technicians đang làm việc
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Nhiệm vụ chờ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.pendingTasks}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Công việc cần phân công
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Hoàn thành hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.completedToday}
            </div>
            <p className="text-xs text-gray-500 mt-1">Nhiệm vụ đã xong</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quản lý Technicians</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Phân công công việc
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Lên lịch làm việc
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Theo dõi hiệu suất
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technicians đang làm việc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-medium">Nguyễn Văn A</p>
              <p className="text-sm text-gray-600">Sửa xe điện Model X</p>
              <p className="text-xs text-green-600 font-medium mt-1">
                Đang làm việc
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-medium">Trần Thị B</p>
              <p className="text-sm text-gray-600">Bảo trì pin Tesla</p>
              <p className="text-xs text-green-600 font-medium mt-1">
                Đang làm việc
              </p>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <p className="font-medium">Lê Văn C</p>
              <p className="text-sm text-gray-600">Chờ phân công</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Chờ việc</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
