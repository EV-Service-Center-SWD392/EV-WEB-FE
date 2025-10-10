export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleType: string; // xe máy, ô tô điện, xe đạp điện
  vehicleBrand: string; // Tesla, VinFast, etc.
  serviceCenter: string;
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
}

export interface CreateBookingRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleType: string;
  vehicleBrand: string;
  serviceCenter: string;
  scheduledDate: string;
  repairParts: string;
  description?: string;
  estimatedCost?: number;
}

export interface UpdateBookingRequest {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleType?: string;
  vehicleBrand?: string;
  serviceCenter?: string;
  technicianId?: string;
  scheduledDate?: string;
  repairParts?: string;
  description?: string;
  status?: BookingStatus;
  estimatedCost?: number;
  actualCost?: number;
}

export interface BookingFilters {
  customerName?: string;
  phone?: string;
  status?: BookingStatus;
  serviceType?: string;
  technicianId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: "asc" | "desc";
}
