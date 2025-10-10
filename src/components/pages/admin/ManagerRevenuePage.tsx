"use client";

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { revenueService } from "@/services/revenueService";
import type {
  RevenueData,
  RevenueFilters,
  RevenueStats,
  TopServiceCenter,
} from "@/entities/revenue.types";

const serviceCenters = [
  "Trung tâm Quận 1",
  "Trung tâm Quận 2",
  "Trung tâm Quận 3",
  "Trung tâm Quận 5",
  "Trung tâm Quận 7",
  "Trung tâm Quận 9",
  "Trung tâm Thủ Đức",
];

export default function ManagerRevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [filters, setFilters] = useState<RevenueFilters>({
    period: "daily",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    totalBookings: 0,
    completionRate: 0,
    averageOrderValue: 0,
    growth: { revenue: 0, bookings: 0 },
  });
  const [topCenters, setTopCenters] = useState<TopServiceCenter[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [data, statsData, centersData] = await Promise.all([
        revenueService.getRevenueData(filters),
        revenueService.getRevenueStats(filters),
        revenueService.getTopServiceCenters(filters),
      ]);

      setRevenueData(data);
      setStats(statsData);
      setTopCenters(centersData);
    } catch (error) {
      console.error("Error loading revenue data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    await loadData();
  };

  const handleResetFilters = () => {
    const emptyFilters: RevenueFilters = { period: "daily" };
    setFilters(emptyFilters);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatGrowth = (growth: number) => {
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
  };

  const exportReport = async () => {
    try {
      const result = await revenueService.exportRevenueReport(filters);
      alert(result);
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Báo cáo doanh thu
            </h1>
            <p className="text-gray-600 mt-1">
              Thống kê và phân tích doanh thu của các trung tâm dịch vụ
            </p>
          </div>
          <Button
            onClick={exportReport}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Bộ lọc thống kê
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Ngày bắt đầu */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Từ ngày</label>
            <Input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>

          {/* Ngày kết thúc */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Đến ngày
            </label>
            <Input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>

          {/* Trung tâm */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Trung tâm dịch vụ
            </label>
            <Select
              value={filters.serviceCenter || "all"}
              onValueChange={(value) => {
                const serviceCenter = value === "all" ? undefined : value;
                setFilters({ ...filters, serviceCenter });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trung tâm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trung tâm</SelectItem>
                {serviceCenters.map((center) => (
                  <SelectItem key={center} value={center}>
                    {center}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chu kỳ */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Chu kỳ thống kê
            </label>
            <Select
              value={filters.period || "daily"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  period: value as RevenueFilters["period"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Theo ngày</SelectItem>
                <SelectItem value="weekly">Theo tuần</SelectItem>
                <SelectItem value="monthly">Theo tháng</SelectItem>
                <SelectItem value="yearly">Theo năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-3">
          <Button
            onClick={handleSearch}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            Lọc dữ liệu
          </Button>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Đặt lại
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tổng doanh thu</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div
            className={`text-sm mt-1 ${stats.growth.revenue >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatGrowth(stats.growth.revenue)} so với kỳ trước
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tổng đơn hàng</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalBookings}
          </div>
          <div
            className={`text-sm mt-1 ${stats.growth.bookings >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatGrowth(stats.growth.bookings)} so với kỳ trước
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tỷ lệ hoàn thành</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.completionRate.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Giá trị đơn TB</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.averageOrderValue)}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      )}

      {/* Revenue Data & Top Centers */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Data Table */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Chi tiết doanh thu
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trung tâm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Doanh thu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tỷ lệ hoàn thành
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueData.map((item) => {
                    const completionRate =
                      item.totalBookings > 0
                        ? (item.completedBookings / item.totalBookings) * 100
                        : 0;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.serviceCenter}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(item.totalRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.completedBookings}/{item.totalBookings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {completionRate.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {revenueData.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Không có dữ liệu</div>
                <div className="text-gray-400 text-sm mt-2">
                  Không tìm thấy dữ liệu doanh thu phù hợp với bộ lọc
                </div>
              </div>
            )}
          </div>

          {/* Top Service Centers */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Top trung tâm
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {topCenters.map((center, index) => (
                <div
                  key={center.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-800"
                          : index === 1
                            ? "bg-gray-100 text-gray-800"
                            : index === 2
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {center.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {center.bookings} đơn •{" "}
                        {center.completionRate.toFixed(1)}% hoàn thành
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(center.revenue)}
                  </div>
                </div>
              ))}

              {topCenters.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-500">Chưa có dữ liệu</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
