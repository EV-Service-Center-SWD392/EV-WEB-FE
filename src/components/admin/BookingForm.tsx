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
import type { Center } from "@/entities/slot.types";
import type { ServiceCatalogOption } from "@/entities/service.types";
import { staffDirectoryService } from "@/services/staffDirectoryService";
import { serviceCatalogService } from "@/services/serviceCatalogService";

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

const toInputDateTimeLocal = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const toIsoString = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};


export function BookingForm({
  booking,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: BookingFormProps) {
  type FormData = {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    vehicleType: string;
    vehicleBrand: string;
    serviceCenter: string;
    technicianId: string;
    scheduledDate: string;
    repairParts: string;
    description: string;
    status: BookingStatus;
    estimatedCost: string;
    actualCost: string;
  };

  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    vehicleType: "",
    vehicleBrand: "",
    vehicleModel: "",
    serviceCenterId: "",
    serviceTypeId: "",
    technicianId: "",
    preferredTime: "",
    scheduledDate: "",
    repairParts: "",
    description: "",
    status: BookingStatus.PENDING,
    estimatedCost: "",
    actualCost: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [centers, setCenters] = useState<Center[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceCatalogOption[]>([]);
  const [isMetaLoading, setIsMetaLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadMetadata() {
      try {
        setIsMetaLoading(true);
        const [centerData, serviceTypeData] = await Promise.all([
          staffDirectoryService.getCenters(),
          serviceCatalogService.getServiceTypes(),
        ]);
        setCenters(centerData);
        setServiceTypes(serviceTypeData);
      } catch (error) {
        console.error("Failed to load booking metadata", error);
      } finally {
        setIsMetaLoading(false);
      }
    }

    void loadMetadata();
  }, []);

  useEffect(() => {
    if (booking) {
      setFormData({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        vehicleType: booking.vehicleType || "",
        vehicleBrand: booking.vehicleBrand,
        vehicleModel: booking.vehicleModel || "",
        serviceCenterId: booking.serviceCenterId || "",
        serviceTypeId: booking.serviceTypeId || "",
        technicianId: booking.technicianId || "",
        preferredTime: toInputDateTimeLocal(booking.preferredTime ?? booking.scheduledDate),
        scheduledDate: toInputDateTimeLocal(booking.scheduledDate),
        repairParts: booking.repairParts || "",
        description: booking.description || "",
        status: (booking.status as BookingStatus) || BookingStatus.PENDING,
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
        vehicleModel: "",
        serviceCenterId: "",
        serviceTypeId: "",
        technicianId: "",
        preferredTime: "",
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

  useEffect(() => {
    if (!booking) return;
    setFormData((prev) => {
      if (prev.serviceCenterId || (!booking.serviceCenter && !booking.serviceCenterName)) {
        return prev;
      }
      const match = centers.find((center) => {
        const name = booking.serviceCenterName ?? booking.serviceCenter;
        return name ? center.name === name : false;
      });
      if (!match) return prev;
      return { ...prev, serviceCenterId: match.id };
    });
  }, [booking, centers]);

  useEffect(() => {
    if (!booking) return;
    setFormData((prev) => {
      if (prev.serviceTypeId || !booking.serviceType) {
        return prev;
      }
      const match = serviceTypes.find((svc) => svc.name === booking.serviceType);
      if (!match) return prev;
      return { ...prev, serviceTypeId: match.id };
    });
  }, [booking, serviceTypes]);

  useEffect(() => {
    if (booking) return;
    setFormData((prev) => {
      let updated = false;
      let draft = prev;

      if (!prev.serviceCenterId && centers.length === 1) {
        draft = draft === prev ? { ...prev } : draft;
        draft.serviceCenterId = centers[0].id;
        updated = true;
      }

      if (!prev.serviceTypeId && serviceTypes.length === 1) {
        draft = draft === prev ? { ...prev } : draft;
        draft.serviceTypeId = serviceTypes[0].id;
        updated = true;
      }

      return updated ? ({ ...draft }) : prev;
    });
  }, [booking, centers, serviceTypes]);

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

    if (!formData.serviceCenterId) {
      newErrors.serviceCenterId = "Trung tâm dịch vụ là bắt buộc";
    }

    if (!formData.serviceTypeId) {
      newErrors.serviceTypeId = "Loại dịch vụ là bắt buộc";
    }

    if (!formData.preferredTime) {
      newErrors.preferredTime = "Thời gian mong muốn là bắt buộc";
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
      const centerName = centers.find((center) => center.id === formData.serviceCenterId)?.name;
      const serviceTypeName = serviceTypes.find((item) => item.id === formData.serviceTypeId)?.name;
      const preferredTimeIso = toIsoString(formData.preferredTime) ?? toIsoString(formData.scheduledDate);
      const scheduledDateIso = toIsoString(formData.scheduledDate) ?? preferredTimeIso ?? new Date().toISOString();

      if (booking) {
        // Convert BookingStatus enum back to API status
        let apiStatus: "Pending" | "Approved" | "Rejected" | undefined;
        if (formData.status === BookingStatus.PENDING) apiStatus = "Pending";
        else if (formData.status === BookingStatus.CONFIRMED) apiStatus = "Approved";
        else if (formData.status === BookingStatus.CANCELLED) apiStatus = "Rejected";

        const updateData: UpdateBookingRequest = {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          vehicleType: formData.vehicleType,
          vehicleBrand: formData.vehicleBrand,
          vehicleModel: formData.vehicleModel,
          serviceCenterId: formData.serviceCenterId || undefined,
          serviceCenter: centerName,
          serviceTypeId: formData.serviceTypeId || undefined,
          serviceType: serviceTypeName,
          technicianId: formData.technicianId || undefined,
          preferredTime: preferredTimeIso,
          scheduledDate: scheduledDateIso,
          repairParts: formData.repairParts || undefined,
          description: formData.description || undefined,
          status: apiStatus,
          estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : undefined,
          actualCost: formData.actualCost ? Number(formData.actualCost) : undefined,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateBookingRequest = {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          vehicleType: formData.vehicleType,
          vehicleBrand: formData.vehicleBrand,
          vehicleModel: formData.vehicleModel,
          serviceCenterId: formData.serviceCenterId,
          serviceTypeId: formData.serviceTypeId,
          preferredTime: preferredTimeIso ?? new Date().toISOString(),
          scheduledDate: scheduledDateIso,
          serviceCenter: centerName,
          serviceType: serviceTypeName,
          repairParts: formData.repairParts || undefined,
          description: formData.description || undefined,
          estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : undefined,
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dòng xe (không bắt buộc)
              </label>
              <Input
                type="text"
                value={formData.vehicleModel}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleModel: e.target.value })
                }
                placeholder="Ví dụ: VF8, Model 3"
              />
            </div>
          </div>

          {/* Service Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trung tâm dịch vụ <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.serviceCenterId}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceCenterId: value })
                }
                disabled={isMetaLoading}
              >
                <SelectTrigger
                  className={errors.serviceCenterId ? "border-red-300" : ""}
                >
                  <SelectValue placeholder="Chọn trung tâm dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  {centers.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-muted-foreground">
                      Không có trung tâm khả dụng
                    </div>
                  ) : (
                    centers.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        <div className="flex flex-col">
                          <span>{center.name}</span>
                          {center.address && (
                            <span className="text-xs text-muted-foreground">
                              {center.address}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.serviceCenterId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.serviceCenterId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại dịch vụ <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.serviceTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceTypeId: value })
                }
                disabled={isMetaLoading}
              >
                <SelectTrigger
                  className={errors.serviceTypeId ? "border-red-300" : ""}
                >
                  <SelectValue placeholder="Chọn loại dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-muted-foreground">
                      Không có dịch vụ khả dụng
                    </div>
                  ) : (
                    serviceTypes.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex flex-col">
                          <span>{service.name}</span>
                          {service.description && (
                            <span className="text-xs text-muted-foreground">
                              {service.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.serviceTypeId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.serviceTypeId}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian mong muốn của khách <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.preferredTime}
                onChange={(e) =>
                  setFormData({ ...formData, preferredTime: e.target.value })
                }
                className={errors.preferredTime ? "border-red-300" : ""}
              />
              {errors.preferredTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.preferredTime}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lịch hẹn dự kiến (Staff có thể điều chỉnh)
              </label>
              <Input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledDate: e.target.value })
                }
              />
            </div>
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
                  <SelectItem value={BookingStatus.ASSIGNED}>
                    Đã phân công kỹ thuật viên
                  </SelectItem>
                  <SelectItem value={BookingStatus.IN_QUEUE}>
                    Trong hàng chờ
                  </SelectItem>
                  <SelectItem value={BookingStatus.ACTIVE}>
                    Đang chuẩn bị
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
                  <SelectItem value={BookingStatus.REASSIGNED}>
                    Đã phân công lại
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
