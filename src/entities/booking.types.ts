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
  serviceCenter?: string;
  serviceTypeId?: string;
  serviceType?: string;
  technicianId?: string;

  // Time Slot
  slotId?: string; // ID của slot từ bookingschedule table
  preferredDate?: string;
  preferredTime?: string;
  scheduledDate?: string;
  preferredStartUtc?: string;
  preferredEndUtc?: string;

  // Booking Details
  repairParts?: string;
  description?: string;
  notes?: string;

  // Cost
  estimatedCost?: number;
  actualCost?: number;

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

/**
 * Filters for booking search/filtering
 */
export interface BookingFilters {
  customerName?: string;
  phone?: string;
  status?: BookingStatus;
  serviceType?: string;
}

/**
 * Main Booking interface (alias for BookingResponseDto)
 */
export type Booking = BookingResponseDto;

/**
 * Request payload for creating a new booking
 */
export interface CreateBookingRequest {
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleId?: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType?: string;
  vehicleVin?: string;
  serviceCenterId?: string;
  serviceCenter?: string;
  serviceTypeId?: string;
  serviceType?: string;
  preferredDate?: string;
  preferredTime?: string;
  scheduledDate?: string;
  preferredStartUtc?: string;
  preferredEndUtc?: string;
  repairParts?: string;
  description?: string;
  notes?: string;
  estimatedCost?: number;
}

/**
 * Request payload for updating an existing booking
 */
export interface UpdateBookingRequest extends Partial<CreateBookingRequest> {
  id?: string;
  status?: "Pending" | "Approved" | "Rejected";
  rejectReason?: string;
  technicianId?: string;
  actualCost?: number;
}
