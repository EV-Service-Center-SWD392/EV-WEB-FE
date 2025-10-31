export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
// Minimal booking entity (used for JSON/mock storage and API-level records)
export interface BookingRecord {
  bookingId: string;
  customerId?: string;
  vehicleId: string;
  slotId?: string;
  notes?: string;
  status: BookingStatus;
  isActive?: boolean;
  createAt: string;
  updateAt: string;
}

// Expanded booking shape used by UI components (keeps backward-compatible ids)
export interface Booking {
  id: string;
  // customer
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // vehicle
  vehicleId: string;
  vehicleBrand: string;
  vehicleType: string;

  // scheduling
  slotId?: string;
  serviceCenter: string;
  scheduledDate: string;

  // details
  repairParts: string;
  description?: string;

  // assignment / cost
  technicianId?: string;
  technicianName?: string;
  estimatedCost?: number;
  actualCost?: number;

  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleType: string;
  vehicleBrand: string;
  serviceCenter: string;
  scheduledDate: string; // ISO
  repairParts: string;
  description?: string;
  estimatedCost?: number;
}

export type UpdateBookingRequest = Partial<CreateBookingRequest> & {
  status?: BookingStatus;
  technicianId?: string;
  actualCost?: number;
};

export interface BookingFilters {
  customerName?: string;
  phone?: string;
  status?: BookingStatus;
  serviceType?: string;
  technicianId?: string;
  sort?: string;
  sortOrder?: "asc" | "desc";
}
