"use client"; // This component now needs state, so it must be a client component.

import React, { useState, useEffect, useMemo } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import {
  BookingModalContent,
  BookingMode,
} from "@/components/member/booking/BookingModalContent";
import { bookingService } from "@/services/bookingService";

export default function MemberBookingPage() {
  interface Booking {
    bookingId: string;
    vehicleId: string;
    vehicle?: {
      licensePlate?: string;
      year?: string | number;
      color?: string;
    };
    notes?: string;
    status?: string;
    bookingDate?: string;
    createdAt?: string;
    createAt?: string;
    slotId?: string;
    slot?: {
      slot?: string | number;
      dayOfWeek?: string;
      startUtc?: string;
      endUtc?: string;
      center?: {
        name?: string;
        address?: string;
      };
    };
  }

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load vehicles when component mounts
  useEffect(() => {
    let mounted = true;
    bookingService.getVehicle().then((data) => {
      if (mounted) {
        setVehicles(Array.isArray(data) ? data : []);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    bookingService.getBookings().then((data) => {
      if (mounted) {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateBooking = () => {
    setIsModalOpen(true);
  };

  const handleSubmitBooking = async (payload: any) => {
    try {
      await bookingService.createBooking(payload);
      handleCloseModal();
      // Refresh booking list
      const data = await bookingService.getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to create booking:", err);
    }
  };

  // Map vehicles by ID for efficient lookup
  const vehiclesById = useMemo(
    () =>
      vehicles.reduce(
        (acc, v) => {
          acc[v.vehicleId] = v;
          return acc;
        },
        {} as Record<string, any>
      ),
    [vehicles]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Appointments
          </h1>
          <p className="mt-1 text-gray-600">
            Manage all your vehicle service appointments here.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Create Booking Card */}
          <button
            onClick={handleCreateBooking}
            className="flex items-center justify-center min-h-[280px] w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Create new booking"
          >
            <PlusIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />
          </button>

          {/* List of Booking Cards */}
          {loading && (
            <div className="col-span-4 text-center text-gray-500">
              Loading...
            </div>
          )}
          {!loading && bookings.length === 0 && (
            <div className="col-span-4 text-center text-gray-500">
              No bookings found.
            </div>
          )}
          {!loading &&
            bookings.length > 0 &&
            bookings.map((booking) => {
              const vehicle = vehiclesById[booking.vehicleId] || {};
              const vehiclePlate =
                booking.vehicle?.licensePlate || vehicle.licensePlate;
              const vehicleYear = booking.vehicle?.year || vehicle.year || "";
              const vehicleColor =
                booking.vehicle?.color || vehicle.color || "";
              const notes = booking.notes || "";
              const status = booking.status || "";
              const bookingDate =
                booking.bookingDate ||
                booking.createdAt ||
                booking.createAt ||
                "";
              const slot = booking.slot || {};
              const slotNumber = slot.slot || booking.slotId || "";
              const dayOfWeek = slot.dayOfWeek || "";
              const startUtc = slot.startUtc || "";
              const endUtc = slot.endUtc || "";
              const centerName = slot.center?.name || "";
              const centerAddress = slot.center?.address || "";

              return (
                <div
                  key={booking.bookingId}
                  className="w-full bg-white rounded-lg shadow p-4 flex flex-col gap-2 border border-gray-200"
                  title={`Booking for ${vehiclePlate}`}
                >
                  <img
                    src="https://www.shutterstock.com/image-vector/flat-car-picture-placeholder-symbol-600nw-2366856295.jpg"
                    alt=""
                  />
                  <div className="font-semibold text-lg text-indigo-700">
                    {vehiclePlate}
                  </div>
                  <div className="text-sm text-gray-600">
                    Year: {vehicleYear} | Color: {vehicleColor}
                  </div>
                  <div className="text-sm text-gray-600">Notes: {notes}</div>
                  <div className="text-sm text-gray-600">
                    Status: <span className="font-bold">{status}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Date: {bookingDate}
                  </div>
                  <div className="text-sm text-gray-600">
                    Slot: {slotNumber} | Day: {dayOfWeek}
                  </div>
                  <div className="text-sm text-gray-600">
                    Time: {startUtc} - {endUtc}
                  </div>
                  <div className="text-sm text-gray-600">
                    Center: {centerName}
                  </div>
                  <div className="text-xs text-gray-400">{centerAddress}</div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Booking Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <BookingModalContent
          mode="CREATE"
          bookingData={{}}
          onClose={handleCloseModal}
          onSubmit={handleSubmitBooking}
        />
      </Modal>
    </div>
  );
}
// End of component
