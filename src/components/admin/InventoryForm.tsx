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
  InventoryItem,
  CreateInventoryRequest,
  UpdateInventoryRequest,
} from "@/entities/inventory.types";

interface InventoryFormProps {
  item?: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    _data: CreateInventoryRequest | UpdateInventoryRequest
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
    partName: "",
    serviceCenter: "",
    quantity: "",
    vehicleBrand: "",
    vehicleType: "",
    unitPrice: "",
    minStock: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        partName: item.partName,
        serviceCenter: item.serviceCenter,
        quantity: item.quantity.toString(),
        vehicleBrand: item.vehicleBrand,
        vehicleType: item.vehicleType,
        unitPrice: item.unitPrice.toString(),
        minStock: item.minStock.toString(),
        isActive: item.isActive,
      });
    } else {
      setFormData({
        partName: "",
        serviceCenter: "",
        quantity: "",
        vehicleBrand: "",
        vehicleType: "",
        unitPrice: "",
        minStock: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [item, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.partName.trim()) {
      newErrors.partName = "Tên linh kiện là bắt buộc";
    }

    if (!formData.serviceCenter) {
      newErrors.serviceCenter = "Trung tâm dịch vụ là bắt buộc";
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = "Số lượng là bắt buộc";
    } else if (
      isNaN(Number(formData.quantity)) ||
      Number(formData.quantity) < 0
    ) {
      newErrors.quantity = "Số lượng phải là số không âm";
    }

    if (!formData.vehicleBrand) {
      newErrors.vehicleBrand = "Hãng xe là bắt buộc";
    }

    if (!formData.vehicleType) {
      newErrors.vehicleType = "Loại xe là bắt buộc";
    }

    if (!formData.unitPrice.trim()) {
      newErrors.unitPrice = "Đơn giá là bắt buộc";
    } else if (
      isNaN(Number(formData.unitPrice)) ||
      Number(formData.unitPrice) <= 0
    ) {
      newErrors.unitPrice = "Đơn giá phải là số dương";
    }

    if (!formData.minStock.trim()) {
      newErrors.minStock = "Tồn kho tối thiểu là bắt buộc";
    } else if (
      isNaN(Number(formData.minStock)) ||
      Number(formData.minStock) < 0
    ) {
      newErrors.minStock = "Tồn kho tối thiểu phải là số không âm";
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
        const updateData: UpdateInventoryRequest = {
          partName: formData.partName,
          serviceCenter: formData.serviceCenter,
          quantity: Number(formData.quantity),
          vehicleBrand: formData.vehicleBrand,
          vehicleType: formData.vehicleType,
          unitPrice: Number(formData.unitPrice),
          minStock: Number(formData.minStock),
          isActive: formData.isActive,
        };
        await onSubmit(updateData);
      } else {
        // Create new item
        const createData: CreateInventoryRequest = {
          partName: formData.partName,
          serviceCenter: formData.serviceCenter,
          quantity: Number(formData.quantity),
          vehicleBrand: formData.vehicleBrand,
          vehicleType: formData.vehicleType,
          unitPrice: Number(formData.unitPrice),
          minStock: Number(formData.minStock),
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
          {/* Tên linh kiện */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên linh kiện <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.partName}
              onChange={(e) =>
                setFormData({ ...formData, partName: e.target.value })
              }
              className={errors.partName ? "border-red-300" : ""}
              placeholder="Ví dụ: Pin Lithium 60V 20Ah"
            />
            {errors.partName && (
              <p className="text-red-500 text-sm mt-1">{errors.partName}</p>
            )}
          </div>

          {/* Thông tin xe tương thích */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hãng xe <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.vehicleBrand}
                onValueChange={(value) =>
                  setFormData({ ...formData, vehicleBrand: value })
                }
              >
                <SelectTrigger
                  className={errors.vehicleBrand ? "border-red-300" : ""}
                >
                  <SelectValue placeholder="Chọn hãng xe" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleBrand && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.vehicleBrand}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại xe <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.vehicleType}
                onValueChange={(value) =>
                  setFormData({ ...formData, vehicleType: value })
                }
              >
                <SelectTrigger
                  className={errors.vehicleType ? "border-red-300" : ""}
                >
                  <SelectValue placeholder="Chọn loại xe" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.vehicleType}
                </p>
              )}
            </div>
          </div>

          {/* Trung tâm dịch vụ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trung tâm dịch vụ <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.serviceCenter}
              onValueChange={(value) =>
                setFormData({ ...formData, serviceCenter: value })
              }
            >
              <SelectTrigger
                className={errors.serviceCenter ? "border-red-300" : ""}
              >
                <SelectValue placeholder="Chọn trung tâm dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {serviceCenters.map((center) => (
                  <SelectItem key={center} value={center}>
                    {center}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceCenter && (
              <p className="text-red-500 text-sm mt-1">
                {errors.serviceCenter}
              </p>
            )}
          </div>

          {/* Thông tin tồn kho và giá */}
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
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: e.target.value })
                }
                className={errors.minStock ? "border-red-300" : ""}
                placeholder="Nhập tồn kho tối thiểu"
              />
              {errors.minStock && (
                <p className="text-red-500 text-sm mt-1">{errors.minStock}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đơn giá (VND) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              value={formData.unitPrice}
              onChange={(e) =>
                setFormData({ ...formData, unitPrice: e.target.value })
              }
              className={errors.unitPrice ? "border-red-300" : ""}
              placeholder="Nhập đơn giá"
            />
            {errors.unitPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.unitPrice}</p>
            )}
          </div>

          {/* Trạng thái (chỉ hiện khi sửa) */}
          {item && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <Select
                value={formData.isActive.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value === "true" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Đang hoạt động</SelectItem>
                  <SelectItem value="false">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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
