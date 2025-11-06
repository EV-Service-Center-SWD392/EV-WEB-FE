export enum BookingStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  IN_QUEUE = "in_queue",
  ACTIVE = "active",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REASSIGNED = "reassigned",
}

// Export individual values to avoid unused warnings
export const { PENDING, ASSIGNED, IN_QUEUE, ACTIVE, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, REASSIGNED } = BookingStatus;

export interface BookingQueryDto {
  page?: number;
  pageSize?: number;
  centerId?: string;
  vehicleId?: string;
  status?: "Pending" | "Approved" | "Rejected";
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
}

/**
 * Response từ /api/client/Booking
 * Includes full customer & vehicle info
 */
export interface BookingResponseDto {
  id: string;
  bookingCode?: string;

  // Customer Info
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Vehicle Info
  vehicleId: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType?: string;
  vehicleVin?: string;

  // Service Info
  serviceCenterId?: string;
  serviceCenterName?: string;
  serviceTypeId?: string;
  serviceType?: string;

  // Time Slot
  preferredDate?: string;
  preferredTime?: string;
  preferredStartUtc?: string;
  preferredEndUtc?: string;

  // Booking Details
  repairParts?: string;
  description?: string;
  notes?: string;

  // Status
  status: "Pending" | "Approved" | "Rejected";

  // Timestamps
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectReason?: string;
}
