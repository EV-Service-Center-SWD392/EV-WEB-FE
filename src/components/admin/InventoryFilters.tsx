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
import type { InventoryFilters as InventoryFiltersType } from "@/entities/inventory.types";

interface InventoryFiltersProps {
  filters: InventoryFiltersType;
  onFiltersChange: (_filters: InventoryFiltersType) => void;
  onSearch: () => void;
  onReset: () => void;
}

const vehicleTypes = ["Xe máy điện", "Ô tô điện", "Xe đạp điện", "Xe tải điện"];

const serviceCenters = [
  "Trung tâm Quận 1",
  "Trung tâm Quận 2",
  "Trung tâm Quận 3",
  "Trung tâm Quận 5",
  "Trung tâm Quận 7",
  "Trung tâm Quận 9",
  "Trung tâm Thủ Đức",
];

export function InventoryFilters({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
}: InventoryFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Bộ lọc tìm kiếm
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Tìm kiếm theo tên linh kiện */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Tên linh kiện
          </label>
          <Input
            placeholder="Nhập tên linh kiện..."
            value={filters.partName || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, partName: e.target.value })
            }
          />
        </div>

        {/* Tìm kiếm theo trung tâm */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Trung tâm dịch vụ
          </label>
          <Select
            value={filters.serviceCenter || "all"}
            onValueChange={(value) => {
              const serviceCenter = value === "all" ? undefined : value;
              onFiltersChange({ ...filters, serviceCenter });
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

        {/* Lọc theo hãng xe */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Hãng xe</label>
          <Input
            placeholder="Nhập hãng xe..."
            value={filters.vehicleBrand || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, vehicleBrand: e.target.value })
            }
          />
        </div>

        {/* Lọc theo loại xe */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Loại xe</label>
          <Select
            value={filters.vehicleType || "all"}
            onValueChange={(value) => {
              const vehicleType = value === "all" ? undefined : value;
              onFiltersChange({ ...filters, vehicleType });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại xe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại xe</SelectItem>
              {vehicleTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lọc tồn kho thấp */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tồn kho</label>
          <Select
            value={filters.lowStock?.toString() || "all"}
            onValueChange={(value) => {
              const lowStock = value === "all" ? undefined : value === "true";
              onFiltersChange({ ...filters, lowStock });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái tồn kho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Tồn kho thấp</SelectItem>
              <SelectItem value="false">Tồn kho đủ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lọc theo trạng thái */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Trạng thái
          </label>
          <Select
            value={filters.isActive?.toString() || "all"}
            onValueChange={(value) => {
              const isActive = value === "all" ? undefined : value === "true";
              onFiltersChange({ ...filters, isActive });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Đang hoạt động</SelectItem>
              <SelectItem value="false">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
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
