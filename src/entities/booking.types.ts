export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Slot {
  id: string;
  centerId: string;
  startUtc: string;
  endUtc: string;
  capacity: number;
  status: "OPEN" | "CLOSED";
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  vehicleId: string;
  slotId: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
