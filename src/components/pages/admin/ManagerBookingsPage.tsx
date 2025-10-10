"use client";

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { BookingFilters } from "@/components/admin/BookingFilters";
import { BookingTable } from "@/components/admin/BookingTable";
import { BookingForm } from "@/components/admin/BookingForm";
import { bookingService } from "@/services/bookingService";
import type {
  Booking,
  BookingFilters as BookingFiltersType,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingStatus,
} from "@/entities/booking.types";

export default function ManagerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [filters, setFilters] = useState<BookingFiltersType>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Load bookings on component mount
  useEffect(() => {
    loadBookings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const data = await bookingService.getBookings(filters);
      setBookings(data);
      setFilteredBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const data = await bookingService.getBookings(filters);
      setFilteredBookings(data);
    } catch (error) {
      console.error("Error searching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    const emptyFilters: BookingFiltersType = {};
    setFilters(emptyFilters);
    setFilteredBookings(bookings);
  };

  const handleCreateBooking = () => {
    setEditingBooking(null);
    setIsFormOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsFormOpen(true);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch đặt này?")) {
      return;
    }

    try {
      await bookingService.deleteBooking(bookingId);
      await loadBookings(); // Reload data
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Có lỗi xảy ra khi xóa lịch đặt");
    }
  };

  const handleUpdateStatus = async (
    bookingId: string,
    status: BookingStatus
  ) => {
    try {
      await bookingService.updateBooking(bookingId, { status });
      await loadBookings(); // Reload data
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handleFormSubmit = async (
    data: CreateBookingRequest | UpdateBookingRequest
  ) => {
    try {
      setIsFormLoading(true);

      if (editingBooking) {
        // Update booking
        await bookingService.updateBooking(
          editingBooking.id,
          data as UpdateBookingRequest
        );
      } else {
        // Create new booking
        await bookingService.createBooking(data as CreateBookingRequest);
      }

      setIsFormOpen(false);
      setEditingBooking(null);
      await loadBookings(); // Reload data
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Có lỗi xảy ra khi lưu dữ liệu");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBooking(null);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý lịch đặt
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý các lịch đặt sửa chữa xe điện trong hệ thống
            </p>
          </div>
          <Button
            onClick={handleCreateBooking}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            Thêm lịch đặt
          </Button>
        </div>
      </div>

      {/* Filters */}
      <BookingFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        onReset={handleResetFilters}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      )}

      {/* Bookings table */}
      {!isLoading && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredBookings.length} / {bookings.length} lịch đặt
            </div>
          </div>

          <BookingTable
            bookings={filteredBookings}
            onEdit={handleEditBooking}
            onDelete={handleDeleteBooking}
            onUpdateStatus={handleUpdateStatus}
          />
        </>
      )}

      {/* Booking Form Modal */}
      <BookingForm
        booking={editingBooking}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />
    </div>
  );
}
