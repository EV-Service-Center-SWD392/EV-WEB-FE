import React from "react";

interface BookingDetailLayoutProps {
  booking: any;
}

export default function BookingDetailLayout({
  booking,
}: BookingDetailLayoutProps) {
  // booking is expected to have bookingId, vehicleId, slotId, notes, status, createAt, updateAt
  return (
    <div className="p-6 max-w-3xl w-full bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
      <div className="space-y-2 text-sm text-gray-700">
        <div>
          <span className="font-medium">Booking ID:</span> {booking.bookingId}
        </div>
        <div>
          <span className="font-medium">Vehicle ID:</span> {booking.vehicleId}
        </div>
        <div>
          <span className="font-medium">Slot ID:</span> {booking.slotId || "-"}
        </div>
        <div>
          <span className="font-medium">Status:</span> {booking.status}
        </div>
        <div>
          <span className="font-medium">Notes:</span> {booking.notes || "-"}
        </div>
        <div className="pt-4 border-t">
          <h3 className="font-semibold">Price</h3>
          <div className="text-lg font-bold text-indigo-600">
            {booking.totalAmount
              ? booking.totalAmount.toLocaleString("en-US") + " VND"
              : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
