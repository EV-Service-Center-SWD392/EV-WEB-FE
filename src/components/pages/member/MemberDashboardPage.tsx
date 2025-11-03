"use client";

import Link from "next/link";

import {
  Car, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText 
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function MemberDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Chào mừng bạn trở lại! Quản lý xe và dịch vụ của bạn.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/member/appointments">
              <Calendar className="mr-2 h-4 w-4" />
              Đặt lịch mới
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/member/workorders">
              <FileText className="mr-2 h-4 w-4" />
              Đơn sửa chữa
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xe đã đăng ký</CardTitle>
            <Car className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-gray-600">
              1 Tesla Model 3, 1 VinFast VF8
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lịch hẹn sắp tới</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-blue-600">
              Bảo dưỡng định kỳ - 25/01/2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dịch vụ hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-green-600">
              +2 từ tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chi phí tháng này</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.450.000₫</div>
            <p className="text-xs text-purple-600">
              Tiết kiệm 15% so với tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Xe của tôi */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Xe của tôi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Tesla Model 3</h3>
                  <p className="text-sm text-gray-600">51A-12345 • 2022</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Bảo dưỡng định kỳ
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Km tiếp theo: 85,000km
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                Hoạt động tốt
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">VinFast VF8</h3>
                  <p className="text-sm text-gray-600">30A-67890 • 2023</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Cần kiểm tra
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Đèn cảnh báo pin
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant="outline">
                Cần chú ý
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Hoạt động gần đây */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Hoàn thành bảo dưỡng</p>
                  <p className="text-xs text-gray-600">Tesla Model 3 • 2 ngày trước</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Đặt lịch thành công</p>
                  <p className="text-xs text-gray-600">VinFast VF8 • 1 tuần trước</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Thanh toán hóa đơn</p>
                  <p className="text-xs text-gray-600">1.250.000₫ • 1 tuần trước</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Lịch hẹn sắp tới</h4>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Bảo dưỡng định kỳ
                </p>
                <p className="text-xs text-blue-700">
                  VinFast VF8 • 25/01/2024 09:00
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Trung tâm Quận 1
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dịch vụ gợi ý */}
      <Card>
        <CardHeader>
          <CardTitle>Dịch vụ được gợi ý</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h4 className="font-medium mb-2">Kiểm tra pin định kỳ</h4>
              <p className="text-sm text-gray-600 mb-3">
                Đảm bảo hiệu suất pin tối ưu cho xe điện của bạn
              </p>
              <Button variant="outline" size="sm">
                Đặt lịch ngay
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h4 className="font-medium mb-2">Cập nhật phần mềm</h4>
              <p className="text-sm text-gray-600 mb-3">
                Cập nhật firmware mới nhất cho hệ thống xe
              </p>
              <Button variant="outline" size="sm">
                Tìm hiểu thêm
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h4 className="font-medium mb-2">Vệ sinh nội thất</h4>
              <p className="text-sm text-gray-600 mb-3">
                Dịch vụ vệ sinh chuyên nghiệp cho nội thất xe
              </p>
              <Button variant="outline" size="sm">
                Xem chi tiết
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
