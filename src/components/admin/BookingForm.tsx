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
import {
  BookingStatus,
  type Booking,
  type CreateBookingRequest,
  type UpdateBookingRequest,
} from "@/entities/booking.types";

interface BookingFormProps {
  booking?: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    _data: CreateBookingRequest | UpdateBookingRequest
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

export function BookingForm({
  booking,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    vehicleType: "",
    vehicleBrand: "",
    serviceCenter: "",
    technicianId: "",
    scheduledDate: "",
    repairParts: "",
    description: "",
    status: BookingStatus.PENDING,
    estimatedCost: "",
    actualCost: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (booking) {
      setFormData({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        vehicleType: booking.vehicleType,
        vehicleBrand: booking.vehicleBrand,
        serviceCenter: booking.serviceCenter,
        technicianId: booking.technicianId || "",
        scheduledDate: booking.scheduledDate.split("T")[0], // Format for date input
        repairParts: booking.repairParts,
        description: booking.description || "",
        status: booking.status,
        estimatedCost: booking.estimatedCost?.toString() || "",
        actualCost: booking.actualCost?.toString() || "",
      });
    } else {
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        vehicleType: "",
        vehicleBrand: "",
        serviceCenter: "",
        technicianId: "",
        scheduledDate: "",
        repairParts: "",
        description: "",
        status: BookingStatus.PENDING,
        estimatedCost: "",
        actualCost: "",
      });
    }
    setErrors({});
  }, [booking, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Tên khách hàng là bắt buộc";
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Email không hợp lệ";
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.customerPhone)) {
      newErrors.customerPhone = "Số điện thoại không hợp lệ";
    }

    if (!formData.vehicleType) {
      newErrors.vehicleType = "Loại xe là bắt buộc";
    }

    if (!formData.vehicleBrand.trim()) {
      newErrors.vehicleBrand = "Hãng xe là bắt buộc";
    }

    if (!formData.serviceCenter) {
      newErrors.serviceCenter = "Trung tâm dịch vụ là bắt buộc";
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = "Ngày hẹn là bắt buộc";
    }

    if (!formData.repairParts.trim()) {
      newErrors.repairParts = "Bộ phận sửa chữa là bắt buộc";
    }

    if (formData.estimatedCost && isNaN(Number(formData.estimatedCost))) {
      newErrors.estimatedCost = "Chi phí dự kiến phải là số";
    }

    if (formData.actualCost && isNaN(Number(formData.actualCost))) {
      newErrors.actualCost = "Chi phí thực tế phải là số";
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
      if (booking) {
        // Update booking
        const updateData: UpdateBookingRequest = {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          vehicleType: formData.vehicleType,
          vehicleBrand: formData.vehicleBrand,
          serviceCenter: formData.serviceCenter,
          technicianId: formData.technicianId || undefined,
          scheduledDate: new Date(formData.scheduledDate).toISOString(),
          repairParts: formData.repairParts,
          description: formData.description || undefined,
          status: formData.status,
          estimatedCost: formData.estimatedCost
            ? Number(formData.estimatedCost)
            : undefined,
          actualCost: formData.actualCost
            ? Number(formData.actualCost)
            : undefined,
        };
        await onSubmit(updateData);
      } else {
        // Create new booking
        const createData: CreateBookingRequest = {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          vehicleType: formData.vehicleType,
          vehicleBrand: formData.vehicleBrand,
          serviceCenter: formData.serviceCenter,
          scheduledDate: new Date(formData.scheduledDate).toISOString(),
          repairParts: formData.repairParts,
          description: formData.description || undefined,
          estimatedCost: formData.estimatedCost
            ? Number(formData.estimatedCost)
            : undefined,
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
          {booking ? "Chỉnh sửa lịch đặt" : "Thêm lịch đặt mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên khách hàng <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className={errors.customerName ? "border-red-300" : ""}
                placeholder="Nhập tên khách hàng"
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.customerName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                className={errors.customerEmail ? "border-red-300" : ""}
                placeholder="Nhập email"
              />
              {errors.customerEmail && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.customerEmail}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) =>
                setFormData({ ...formData, customerPhone: e.target.value })
              }
              className={errors.customerPhone ? "border-red-300" : ""}
              placeholder="Nhập số điện thoại"
            />
            {errors.customerPhone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customerPhone}
              </p>
            )}
          </div>

          {/* Vehicle Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Service Information */}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày hẹn <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) =>
                setFormData({ ...formData, scheduledDate: e.target.value })
              }
              className={errors.scheduledDate ? "border-red-300" : ""}
            />
            {errors.scheduledDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.scheduledDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bộ phận sửa chữa <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.repairParts}
              onChange={(e) =>
                setFormData({ ...formData, repairParts: e.target.value })
              }
              className={errors.repairParts ? "border-red-300" : ""}
              placeholder="Ví dụ: Pin, Motor, Phanh"
            />
            {errors.repairParts && (
              <p className="text-red-500 text-sm mt-1">{errors.repairParts}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Mô tả chi tiết về vấn đề cần sửa chữa"
            />
          </div>

          {/* Cost Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chi phí dự kiến (VND)
              </label>
              <Input
                type="number"
                value={formData.estimatedCost}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedCost: e.target.value })
                }
                className={errors.estimatedCost ? "border-red-300" : ""}
                placeholder="Nhập chi phí dự kiến"
              />
              {errors.estimatedCost && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.estimatedCost}
                </p>
              )}
            </div>

            {booking && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chi phí thực tế (VND)
                </label>
                <Input
                  type="number"
                  value={formData.actualCost}
                  onChange={(e) =>
                    setFormData({ ...formData, actualCost: e.target.value })
                  }
                  className={errors.actualCost ? "border-red-300" : ""}
                  placeholder="Nhập chi phí thực tế"
                />
                {errors.actualCost && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.actualCost}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Status (chỉ hiện khi sửa) */}
          {booking && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as BookingStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                  <SelectItem value={BookingStatus.CANCELLED}>
                    Đã hủy
                  </SelectItem>
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
              {isLoading ? "Đang xử lý..." : booking ? "Cập nhật" : "Tạo mới"}
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
