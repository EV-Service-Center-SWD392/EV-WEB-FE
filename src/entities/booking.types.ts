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

export interface BookingFilters {
  customerName?: string;
  phone?: string;
  status?: BookingStatus;
  serviceType?: string;
}

/**
 * Legacy Booking type for internal forms and display
 * This is a more flexible type used in components that may not have all API response fields
 */
export interface Booking {
  id: string;
  bookingCode?: string;

  // Customer Info
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Vehicle Info
  vehicleId?: string;
  vehicleBrand: string;
  vehicleModel?: string;
  vehicleType?: string;
  vehicleVin?: string;

  // Service Info
  serviceCenterId?: string;
  serviceCenterName?: string;
  serviceCenter?: string;
  serviceTypeId?: string;
  serviceType?: string;

  // Technician Assignment
  technicianId?: string;
  technicianName?: string;

  // Time Slot
  preferredDate?: string;
  preferredTime?: string;
  preferredStartUtc?: string;
  preferredEndUtc?: string;
  scheduledDate?: string;

  // Booking Details
  repairParts?: string;
  description?: string;
  notes?: string;

  // Cost
  estimatedCost?: number;
  actualCost?: number;

  // Status
  status: BookingStatus | "Pending" | "Approved" | "Rejected";

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectReason?: string;
}

/**
 * Request payload for creating a new booking
 */
export interface CreateBookingRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleType?: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleVin?: string;
  serviceCenterId?: string;
  serviceCenter?: string;
  serviceTypeId?: string;
  serviceType?: string;
  preferredTime?: string;
  scheduledDate?: string;
  repairParts?: string;
  description?: string;
  estimatedCost?: number;
}

/**
 * Request payload for updating an existing booking
 */
export interface UpdateBookingRequest {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleType?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleVin?: string;
  serviceCenterId?: string;
  serviceCenter?: string;
  serviceTypeId?: string;
  serviceType?: string;
  technicianId?: string;
  preferredTime?: string;
  scheduledDate?: string;
  repairParts?: string;
  description?: string;
  status?: BookingStatus;
  estimatedCost?: number;
  actualCost?: number;
}

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
