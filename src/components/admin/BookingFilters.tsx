"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingStatus } from "@/entities/booking.types";
import type { BookingFilters as BookingFiltersType } from "@/entities/booking.types";

interface BookingFiltersProps {
  filters: BookingFiltersType;
  onFiltersChange: (_filters: BookingFiltersType) => void;
  onSearch: () => void;
  onReset: () => void;
}

export function BookingFilters({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
}: BookingFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Bộ lọc tìm kiếm
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Tìm kiếm theo tên khách hàng */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Tên khách hàng
          </label>
          <Input
            placeholder="Nhập tên khách hàng..."
            value={filters.customerName || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, customerName: e.target.value })
            }
          />
        </div>

        {/* Tìm kiếm theo số điện thoại */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Số điện thoại
          </label>
          <Input
            placeholder="Nhập số điện thoại..."
            value={filters.phone || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, phone: e.target.value })
            }
          />
        </div>

        {/* Lọc theo trạng thái */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Trạng thái
          </label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => {
              const status =
                value === "all" ? undefined : (value as BookingStatus);
              onFiltersChange({ ...filters, status });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value={BookingStatus.PENDING}>
                Chờ xác nhận
              </SelectItem>
              <SelectItem value={BookingStatus.CONFIRMED}>
                Đã xác nhận
              </SelectItem>
              <SelectItem value={BookingStatus.IN_PROGRESS}>
                Đang thực hiện
              </SelectItem>
              <SelectItem value={BookingStatus.COMPLETED}>
                Hoàn thành
              </SelectItem>
              <SelectItem value={BookingStatus.CANCELLED}>Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lọc theo dịch vụ */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Dịch vụ</label>
          <Input
            placeholder="Nhập tên dịch vụ..."
            value={filters.serviceType || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, serviceType: e.target.value })
            }
          />
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex gap-3">
        <Button
          onClick={onSearch}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          Tìm kiếm
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
