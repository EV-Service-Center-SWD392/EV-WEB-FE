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
import type {
  InventoryDto,
  CreateInventoryDto,
  UpdateInventoryDto,
} from "@/entities/inventory.types";

interface InventoryFormProps {
  item?: InventoryDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    _data: CreateInventoryDto | UpdateInventoryDto
  ) => Promise<void>;
  isLoading?: boolean;
}

const vehicleTypes = ["Xe máy điện", "Ô tô điện", "Xe đạp điện", "Xe tải điện"];

const vehicleBrands = [
  "VinFast",
  "Tesla",
  "Gogoro",
  "Pega",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Hyundai",
  "Honda",
];

const serviceCenters = [
  "Trung tâm Quận 1",
  "Trung tâm Quận 2",
  "Trung tâm Quận 3",
  "Trung tâm Quận 5",
  "Trung tâm Quận 7",
  "Trung tâm Quận 9",
  "Trung tâm Thủ Đức",
];

export function InventoryForm({
  item,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: InventoryFormProps) {
  const [formData, setFormData] = useState({
    centerId: "",
    quantity: "",
    minimumStockLevel: "",
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        centerId: item.centerId,
        quantity: (item.quantity || 0).toString(),
        minimumStockLevel: (item.minimumStockLevel || 0).toString(),
        status: item.status || "ACTIVE",
      });
    } else {
      setFormData({
        centerId: "",
        quantity: "",
        minimumStockLevel: "",
        status: "ACTIVE",
      });
    }
    setErrors({});
  }, [item, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.centerId.trim()) {
      newErrors.centerId = "Trung tâm dịch vụ là bắt buộc";
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = "Số lượng là bắt buộc";
    } else if (
      isNaN(Number(formData.quantity)) ||
      Number(formData.quantity) < 0
    ) {
      newErrors.quantity = "Số lượng phải là số không âm";
    }

    if (!formData.minimumStockLevel.trim()) {
      newErrors.minimumStockLevel = "Tồn kho tối thiểu là bắt buộc";
    } else if (
      isNaN(Number(formData.minimumStockLevel)) ||
      Number(formData.minimumStockLevel) < 0
    ) {
      newErrors.minimumStockLevel = "Tồn kho tối thiểu phải là số không âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (item) {
        // Update item
        const updateData: UpdateInventoryDto = {
          quantity: Number(formData.quantity),
          minimumStockLevel: Number(formData.minimumStockLevel),
          status: formData.status,
        };
        await onSubmit(updateData);
      } else {
        // Create new item
        const createData: CreateInventoryDto = {
          centerId: formData.centerId,
          quantity: Number(formData.quantity),
          minimumStockLevel: Number(formData.minimumStockLevel),
        };
        await onSubmit(createData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {item ? "Chỉnh sửa linh kiện" : "Thêm linh kiện mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trung tâm dịch vụ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Center ID <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.centerId}
              onChange={(e) =>
                setFormData({ ...formData, centerId: e.target.value })
              }
              className={errors.centerId ? "border-red-300" : ""}
              placeholder="Nhập Center ID"
            />
            {errors.centerId && (
              <p className="text-red-500 text-sm mt-1">{errors.centerId}</p>
            )}
          </div>

          {/* Thông tin tồn kho */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng hiện tại <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className={errors.quantity ? "border-red-300" : ""}
                placeholder="Nhập số lượng"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho tối thiểu <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                value={formData.minimumStockLevel}
                onChange={(e) =>
                  setFormData({ ...formData, minimumStockLevel: e.target.value })
                }
                className={errors.minimumStockLevel ? "border-red-300" : ""}
                placeholder="Nhập tồn kho tối thiểu"
              />
              {errors.minimumStockLevel && (
                <p className="text-red-500 text-sm mt-1">{errors.minimumStockLevel}</p>
              )}
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isLoading ? "Đang xử lý..." : item ? "Cập nhật" : "Tạo mới"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
