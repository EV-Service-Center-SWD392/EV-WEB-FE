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
  bookingCode?: string;

  // Customer Info
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
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel?: string;
  vehicleVin?: string;
  serviceCenterId: string;
  serviceCenter?: string;
  serviceTypeId: string;
  serviceType?: string;
  preferredTime: string;
  scheduledDate: string; // ISO
  repairParts?: string;
  description?: string;
  estimatedCost?: number;
}

export type UpdateBookingRequest = Partial<CreateBookingRequest> & {
  status?: BookingStatus;
  technicianId?: string;
  actualCost?: number;
};

export interface BookingQueryDto {
  page?: number;
  pageSize?: number;
  centerId?: string;
  vehicleId?: string;
  status?: "Pending" | "Approved" | "Rejected";
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
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
};

export interface BookingQueryDto {
  page?: number;
  pageSize?: number;
  centerId?: string;
  vehicleId?: string;
  status?: "Pending" | "Approved" | "Rejected";
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
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
  sort?: string;
  sortOrder?: "asc" | "desc";
}
