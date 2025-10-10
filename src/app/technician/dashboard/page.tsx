"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TechnicianDashboard() {
  const [stats, setStats] = useState({
    assignedTasks: 0,
    completedToday: 0,
    inProgress: 0,
    avgCompletionTime: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real data from API
    setTimeout(() => {
      setStats({
        assignedTasks: 5,
        completedToday: 3,
        inProgress: 2,
        avgCompletionTime: 45,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Technician
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý công việc sửa chữa xe điện
          </p>
        </div>
        <Button variant="outline">Xuất báo cáo</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Nhiệm vụ được giao
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.assignedTasks}
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
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.completedToday}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Đang thực hiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.inProgress}
            </p>
            <Badge variant="outline" className="mt-1">
              Hoạt động
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Thời gian TB (phút)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.avgCompletionTime}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nhiệm vụ hiện tại</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Sửa chữa pin Tesla Model 3
                  </h4>
                  <p className="text-sm text-gray-600">
                    Khách hàng: Nguyễn Văn A
                  </p>
                  <p className="text-sm text-gray-600">Ưu tiên: Cao</p>
                </div>
                <Badge>Đang làm</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Hoàn thành</Button>
                <Button size="sm" variant="outline">
                  Tạm dừng
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Bảo trì định kỳ BMW i3
                  </h4>
                  <p className="text-sm text-gray-600">
                    Khách hàng: Trần Thị B
                  </p>
                  <p className="text-sm text-gray-600">Ưu tiên: Trung bình</p>
                </div>
                <Badge variant="outline">Chờ bắt đầu</Badge>
              </div>
              <Button size="sm" variant="outline">
                Bắt đầu
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoàn thành gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  Thay lọc gió VinFast VF8
                </p>
                <p className="text-sm text-gray-600">
                  Hoàn thành 30 phút trước
                </p>
              </div>
              <Badge variant="outline">Xong</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  Kiểm tra hệ thống điện Audi e-tron
                </p>
                <p className="text-sm text-gray-600">Hoàn thành 1 giờ trước</p>
              </div>
              <Badge variant="outline">Xong</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  Cập nhật phần mềm Hyundai Kona
                </p>
                <p className="text-sm text-gray-600">Hoàn thành 2 giờ trước</p>
              </div>
              <Badge variant="outline">Xong</Badge>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-700"
              >
                Xem tất cả lịch sử →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
