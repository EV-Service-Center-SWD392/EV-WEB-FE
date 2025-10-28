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

export function BookingTable({
  bookings,
  onEdit,
  onDelete,
  onUpdateStatus,
}: BookingTableProps) {
  const getStatusBadgeColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case BookingStatus.CONFIRMED:
        return "bg-blue-100 text-blue-800";
      case BookingStatus.IN_PROGRESS:
        return "bg-purple-100 text-purple-800";
      case BookingStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case BookingStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplayName = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return "Chờ xác nhận";
      case BookingStatus.CONFIRMED:
        return "Đã xác nhận";
      case BookingStatus.IN_PROGRESS:
        return "Đang thực hiện";
      case BookingStatus.COMPLETED:
        return "Hoàn thành";
      case BookingStatus.CANCELLED:
        return "Đã hủy";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "-";
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
            {bookings.map((booking, index) => (
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
                    <div className="text-sm text-gray-500">
                      {booking.repairParts}
                    </div>
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
                    {booking.serviceCenter}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(booking.scheduledDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusBadgeColor(booking.status)}>
                    {getStatusDisplayName(booking.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">
                      {formatCurrency(
                        booking.actualCost || booking.estimatedCost
                      )}
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
                    {booking.status === BookingStatus.PENDING && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onUpdateStatus(booking.id, BookingStatus.CONFIRMED)
                        }
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Xác nhận
                      </Button>
                    )}
                    {booking.status === BookingStatus.CONFIRMED && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onUpdateStatus(booking.id, BookingStatus.IN_PROGRESS)
                        }
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        Bắt đầu
                      </Button>
                    )}
                    {booking.status === BookingStatus.IN_PROGRESS && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onUpdateStatus(booking.id, BookingStatus.COMPLETED)
                        }
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Hoàn thành
                      </Button>
                    )}
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
            ))}
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
