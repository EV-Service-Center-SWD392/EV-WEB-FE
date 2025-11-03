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

export interface Booking {
  id: string;
  bookingCode?: string;
  serviceCenterId?: string;
  serviceCenterName?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleType: string; // xe máy, ô tô điện, xe đạp điện
  vehicleBrand: string; // Tesla, VinFast, etc.
  vehicleModel?: string;
  vehicleVin?: string;
  serviceCenter?: string; // legacy display string
  serviceTypeId?: string;
  serviceType?: string;
  preferredTime?: string;
  technicianId?: string;
  technicianName?: string;
  scheduledDate: string;
  repairParts: string; // bộ phận cần sửa
  description?: string;
  status: BookingStatus;
  estimatedCost?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
  assignmentStatus?: BookingStatus;
  notes?: string;
}

export interface CreateBookingRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel?: string;
  vehicleVin?: string;
  serviceCenterId: string;
  serviceTypeId: string;
  preferredTime: string; // ISO string
  scheduledDate: string;
  serviceCenter?: string; // legacy support
  serviceType?: string; // legacy support
  repairParts?: string;
  description?: string;
  estimatedCost?: number;
  notes?: string;
}

export interface UpdateBookingRequest {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleType?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleVin?: string;
  serviceCenterId?: string;
  serviceTypeId?: string;
  preferredTime?: string;
  serviceCenter?: string;
  serviceType?: string;
  technicianId?: string;
  scheduledDate?: string;
  repairParts?: string;
  description?: string;
  status?: BookingStatus;
  assignmentStatus?: BookingStatus;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
}

export interface BookingFilters {
  customerName?: string;
  phone?: string;
  status?: BookingStatus;
  assignmentStatus?: BookingStatus;
  centerId?: string;
  serviceType?: string;
  serviceTypeId?: string;
  technicianId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: "asc" | "desc";
}
