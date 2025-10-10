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
import { UserRole } from "@/entities/user.types";
import type { UserFilters as UserFiltersType } from "@/entities/user.types";

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (_filters: UserFiltersType) => void;
  onSearch: () => void;
  onReset: () => void;
}

export function UserFilters({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
}: UserFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Bộ lọc tìm kiếm
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Tìm kiếm theo tên */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Tên người dùng
          </label>
          <Input
            placeholder="Nhập tên..."
            value={filters.name || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, name: e.target.value })
            }
          />
        </div>

        {/* Tìm kiếm theo email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input
            placeholder="Nhập email..."
            type="email"
            value={filters.email || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, email: e.target.value })
            }
          />
        </div>

        {/* Lọc theo vai trò */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Vai trò</label>
          <Select
            value={filters.role || "all"}
            onValueChange={(value) => {
              const role = value === "all" ? undefined : (value as UserRole);
              onFiltersChange({ ...filters, role });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
              <SelectItem value={UserRole.STAFF}>Staff</SelectItem>
              <SelectItem value={UserRole.TECHNICIAN}>Technician</SelectItem>
              <SelectItem value={UserRole.MEMBER}>Member</SelectItem>
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
              <SelectItem value="true">Hoạt động</SelectItem>
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
