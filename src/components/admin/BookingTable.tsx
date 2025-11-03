"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingStatus, type Booking } from "@/entities/booking.types";

interface BookingTableProps {
  bookings: Booking[];
  onEdit: (_booking: Booking) => void;
  onDelete: (_bookingId: string) => void;
  onUpdateStatus: (_bookingId: string, _status: BookingStatus) => void;
}

const getStatusBadge = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.PENDING:
      return { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-800" };
    case BookingStatus.ASSIGNED:
      return { label: "Đã phân công kỹ thuật viên", className: "bg-blue-100 text-blue-800" };
    case BookingStatus.IN_QUEUE:
      return { label: "Trong hàng chờ", className: "bg-slate-100 text-slate-800" };
    case BookingStatus.ACTIVE:
      return { label: "Đang chuẩn bị", className: "bg-indigo-100 text-indigo-800" };
    case BookingStatus.CONFIRMED:
      return { label: "Đã xác nhận", className: "bg-cyan-100 text-cyan-800" };
    case BookingStatus.IN_PROGRESS:
      return { label: "Đang thực hiện", className: "bg-purple-100 text-purple-800" };
    case BookingStatus.REASSIGNED:
      return { label: "Đã phân công lại", className: "bg-orange-100 text-orange-800" };
    case BookingStatus.COMPLETED:
      return { label: "Hoàn thành", className: "bg-green-100 text-green-800" };
    case BookingStatus.CANCELLED:
      return { label: "Đã hủy", className: "bg-red-100 text-red-800" };
    default:
      return { label: status, className: "bg-gray-100 text-gray-800" };
  }
};

export function BookingTable({
  bookings,
  onEdit,
  onDelete,
  onUpdateStatus: _onUpdateStatus,
}: BookingTableProps) {
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Xe & Dịch vụ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kỹ thuật viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lịch hẹn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chi phí
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking, index) => {
              const assignmentStatus = booking.assignmentStatus ?? booking.status;
              const statusBadge = getStatusBadge(booking.status);
              const assignmentBadge = getStatusBadge(assignmentStatus);
              return (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.customerPhone}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.vehicleBrand} ({booking.vehicleType})
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        {booking.serviceType ?? "-"}
                      </div>
                      {booking.repairParts && (
                        <div className="text-sm text-gray-500">
                          {booking.repairParts}
                        </div>
                      )}
                      {booking.description && (
                        <div className="text-sm text-gray-400 truncate max-w-xs">
                          {booking.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.technicianName || "-"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.serviceCenterName ?? booking.serviceCenter ?? "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.scheduledDate)}
                    </div>
                    {booking.preferredTime && (
                      <div className="text-xs text-gray-500 mt-1">
                        Yêu cầu: {formatDate(booking.preferredTime)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <Badge className={assignmentBadge.className}>{assignmentBadge.label}</Badge>
                      {assignmentStatus !== booking.status && (
                        <Badge variant="outline">{statusBadge.label}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {formatCurrency(booking.actualCost || booking.estimatedCost)}
                      </div>
                      {booking.actualCost &&
                        booking.estimatedCost &&
                        booking.actualCost !== booking.estimatedCost && (
                          <div className="text-xs text-gray-500">
                            Dự kiến: {formatCurrency(booking.estimatedCost)}
                          </div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(booking)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(booking.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Không có dữ liệu</div>
          <div className="text-gray-400 text-sm mt-2">
            Không tìm thấy lịch đặt nào phù hợp với bộ lọc hiện tại
          </div>
        </div>
      )}
    </div>
  );
}
