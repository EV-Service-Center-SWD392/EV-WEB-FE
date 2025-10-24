"use client";

import React from "react";
import { 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Brain,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { 
  SparepartStats,
  SparepartDto,
  SparepartForecastDto,
  SparepartReplenishmentRequestDto 
} from "@/entities/sparepart.types";

interface SparepartOverviewProps {
  stats: SparepartStats;
  spareparts: SparepartDto[];
  forecasts: SparepartForecastDto[];
  requests: SparepartReplenishmentRequestDto[];
  onRefresh: () => void;
}

export function SparepartOverview({
  stats,
  spareparts,
  forecasts,
  requests,
  onRefresh
}: SparepartOverviewProps) {
  const lowStockItems = spareparts.filter(sp => 
    sp.status === "LowStock" || sp.status === "OutOfStock"
  );

  const pendingRequests = requests.filter(req => req.status === "Pending");
  const recentForecasts = forecasts.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case "LowStock":
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">Tồn kho thấp</Badge>;
      case "OutOfStock":
        return <Badge variant="destructive">Hết hàng</Badge>;
      case "Pending":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Chờ xử lý</Badge>;
      case "Approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Hiệu suất tồn kho
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {((stats.totalSpareparts - stats.outOfStockCount) / Math.max(stats.totalSpareparts, 1) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalSpareparts - stats.outOfStockCount} / {stats.totalSpareparts} phụ tùng có sẵn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Dự báo AI thông minh
            </CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {forecasts.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {forecasts.filter(f => f.status === "Approved").length} dự báo đã duyệt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tự động hóa bổ sung
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingRequests.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Yêu cầu bổ sung đang chờ xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tối ưu hóa chi phí
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              15.2%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tiết kiệm ước tính với AI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Warnings */}
      {(stats.outOfStockCount > 0 || stats.lowStockCount > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Cảnh báo tồn kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.outOfStockCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">Hết hàng</p>
                    <p className="text-sm text-red-600">{stats.outOfStockCount} phụ tùng cần bổ sung ngay</p>
                  </div>
                  <Badge variant="destructive">{stats.outOfStockCount}</Badge>
                </div>
              )}
              
              {stats.lowStockCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
                  <div>
                    <p className="font-medium text-yellow-800">Tồn kho thấp</p>
                    <p className="text-sm text-yellow-600">{stats.lowStockCount} phụ tùng cần theo dõi</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                    {stats.lowStockCount}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Phụ tùng cần chú ý
              </CardTitle>
              <CardDescription>
                Danh sách phụ tùng có tồn kho thấp hoặc hết hàng
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Tất cả phụ tùng đều có tồn kho đầy đủ</p>
                </div>
              ) : (
                lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.sparepartId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.manufacture} • {formatCurrency(item.unitPrice || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(item.status || "Active")}
                    </div>
                  </div>
                ))
              )}
              
              {lowStockItems.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="link" size="sm">
                    Xem thêm {lowStockItems.length - 5} phụ tùng
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent AI Forecasts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Dự báo AI gần nhất
              </CardTitle>
              <CardDescription>
                Các dự báo nhu cầu phụ tùng từ hệ thống AI
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <PieChart className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentForecasts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có dự báo nào được tạo</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Tạo dự báo AI
                  </Button>
                </div>
              ) : (
                recentForecasts.map((forecast) => (
                  <div key={forecast.forecastId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Phụ tùng #{forecast.sparepartId.slice(-8)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>Dự báo: {forecast.predictedUsage || 0} đơn vị</span>
                        <span>Tin cậy: {((forecast.forecastConfidence || 0) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(forecast.status || "Pending")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Hành động nhanh
          </CardTitle>
          <CardDescription>
            Các tác vụ thường dùng để quản lý phụ tùng hiệu quả
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Brain className="h-6 w-6 text-purple-500" />
              <span className="text-sm">Tạo dự báo AI</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 text-orange-500" />
              <span className="text-sm">Yêu cầu bổ sung</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Package className="h-6 w-6 text-blue-500" />
              <span className="text-sm">Thêm phụ tùng</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BarChart3 className="h-6 w-6 text-green-500" />
              <span className="text-sm">Báo cáo chi tiết</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}