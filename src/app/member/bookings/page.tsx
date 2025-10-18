"use client"; // This component now needs state, so it must be a client component.

import { useState } from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Modal from "../../../components/Modal";
import {
  BookingCard,
  MOCK_BOOKINGS_DATA,
  OrderStatus,
} from "../../../components/member/booking/BookingCard";
import {
  BookingModalContent,
  BookingMode,
  BookingDetailsData,
} from "../../../components/member/booking/BookingModalContent";

const MOCK_DETAIL_DATA: BookingDetailsData = {
  id: "1",
  vehicleName: "Vinfast VF8",
  licensePlate: "51K-123.45",
  vehicleImageUrl: "/images/vf8.jpg",
  serviceCenter: "Vinfast Center Q7",
  scheduledAt: "2025-10-20T09:00:00Z",
  status: "PROPOSING",
  technician: { name: "Bao Tran", phone: "098-765-4321" },
  services: [
    { id: "s1", name: "General Inspection", price: 500000 },
    { id: "s2", name: "Battery Health Check", price: 750000 },
  ],
  parts: [
    { id: "p1", name: "Michelin Pilot Sport EV Tire", price: 3500000 },
    { id: "p2", name: "Wiper Blade Set", price: 450000 },
  ],
  notes:
    "Customer reports a slight squeaking noise from the front left wheel when braking at low speeds.",
  totalAmount: 5200000,
};

export default function MemberBookingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<BookingMode>("VIEW");
  const [currentBooking, setCurrentBooking] =
    useState<Partial<BookingDetailsData> | null>(null);

  const openModal = (mode: BookingMode, data: Partial<BookingDetailsData>) => {
    setModalMode(mode);
    setCurrentBooking(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBooking(null);
  };

  const handleCreateBooking = () => {
    // Open modal with empty data for creation
    openModal("CREATE", { vehicleImageUrl: "/images/placeholder.jpg" });
  };

  const handleCardClick = (booking: any) => {
    // Determine the mode based on the booking's order status
    const status = booking.status as OrderStatus;
    if (status === "PROPOSING") {
      openModal("PROPOSE", MOCK_DETAIL_DATA);
    } else {
      openModal("VIEW", MOCK_DETAIL_DATA);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header and Filters (same as before) */}
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
          <div
            onClick={handleCreateBooking}
            className="flex items-center justify-center min-h-[280px] border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {/* ... PlusIcon etc. */}
          </div>

          {/* List of Booking Cards */}
          {MOCK_BOOKINGS_DATA.map((booking) => (
            <div key={booking.id} onClick={() => handleCardClick(booking)}>
              <BookingCard booking={booking} />
            </div>
          ))}
        </div>
      </div>

      {/* Modal Integration */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {currentBooking && (
          <BookingModalContent
            mode={modalMode}
            bookingData={currentBooking}
            onClose={closeModal}
            onSubmit={(payload) => {
              console.log(`Submitting for mode: ${modalMode}`, payload);
              closeModal();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
