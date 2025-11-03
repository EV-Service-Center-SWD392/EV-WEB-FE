import { api } from "@/services/api";

import {
  Booking,
  BookingStatus,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingFilters,
} from "@/entities/booking.types";

const BASE_PATH = "/api/bookings";
const CREATE_PATH = "/api/Booking";
const USE_MOCK_DATA = false;

const mockBookings: Booking[] = [
  {
    id: "booking-001",
    bookingCode: "BK-001",
    serviceCenterId: "center-1",
    serviceCenterName: "EV Service Center - Quận 1",
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@email.com",
    customerPhone: "0901234567",
    vehicleType: "Xe máy điện",
    vehicleBrand: "VinFast",
    serviceTypeId: "svc-maintenance",
    serviceType: "Bảo dưỡng định kỳ",
    technicianId: "tech-1",
    technicianName: "Trần Văn B",
    preferredTime: "2024-01-15T09:00:00Z",
    scheduledDate: "2024-01-15T09:30:00Z",
    repairParts: "Pin, Motor",
    description: "Thay pin và kiểm tra motor",
    status: BookingStatus.PENDING,
    assignmentStatus: BookingStatus.PENDING,
    estimatedCost: 2_000_000,
    actualCost: 1_950_000,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "booking-002",
    bookingCode: "BK-002",
    serviceCenterId: "center-2",
    serviceCenterName: "EV Service Center - Quận 7",
    customerName: "Lê Thị C",
    customerEmail: "lethic@email.com",
    customerPhone: "0912345678",
    vehicleType: "Ô tô điện",
    vehicleBrand: "Tesla",
    serviceTypeId: "svc-charger",
    serviceType: "Sửa chữa hệ thống sạc",
    technicianId: "tech-2",
    technicianName: "Phạm Văn D",
    preferredTime: "2024-01-16T13:30:00Z",
    scheduledDate: "2024-01-16T14:00:00Z",
    repairParts: "Hệ thống sạc",
    description: "Sửa chữa hệ thống sạc nhanh",
    status: BookingStatus.CONFIRMED,
    assignmentStatus: BookingStatus.ASSIGNED,
    estimatedCost: 5_000_000,
    createdAt: "2024-01-11T10:00:00Z",
    updatedAt: "2024-01-12T15:00:00Z",
  },
  {
    id: "booking-003",
    bookingCode: "BK-003",
    serviceCenterId: "center-3",
    serviceCenterName: "EV Service Center - Thủ Đức",
    customerName: "Hoàng Văn E",
    customerEmail: "hoangvane@email.com",
    customerPhone: "0923456789",
    vehicleType: "Xe đạp điện",
    vehicleBrand: "Pega",
    serviceTypeId: "svc-safety",
    serviceType: "Kiểm tra an toàn",
    technicianId: "tech-3",
    technicianName: "Ngô Thị F",
    preferredTime: "2024-01-17T10:00:00Z",
    scheduledDate: "2024-01-17T10:30:00Z",
    repairParts: "Phanh, Đèn LED",
    description: "Thay phanh và sửa đèn LED",
    status: BookingStatus.IN_PROGRESS,
    assignmentStatus: BookingStatus.ACTIVE,
    estimatedCost: 800_000,
    actualCost: 750_000,
    createdAt: "2024-01-12T09:30:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
  },
  {
    id: "booking-004",
    bookingCode: "BK-004",
    serviceCenterId: "center-1",
    serviceCenterName: "EV Service Center - Quận 1",
    customerName: "Vũ Thị G",
    customerEmail: "vuthig@email.com",
    customerPhone: "0934567890",
    vehicleType: "Xe máy điện",
    vehicleBrand: "Gogoro",
    serviceTypeId: "svc-parts",
    serviceType: "Thay thế phụ tùng",
    technicianId: "tech-1",
    technicianName: "Trần Văn B",
    preferredTime: "2024-01-14T15:30:00Z",
    scheduledDate: "2024-01-14T16:00:00Z",
    repairParts: "Lốp xe, Phanh",
    description: "Thay lốp và kiểm tra hệ thống phanh",
    status: BookingStatus.COMPLETED,
    assignmentStatus: BookingStatus.COMPLETED,
    estimatedCost: 1_200_000,
    actualCost: 1_150_000,
    createdAt: "2024-01-08T14:20:00Z",
    updatedAt: "2024-01-14T17:00:00Z",
  },
];

const statusOrder: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.ASSIGNED,
  BookingStatus.IN_QUEUE,
  BookingStatus.ACTIVE,
  BookingStatus.CONFIRMED,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
  BookingStatus.REASSIGNED,
  BookingStatus.CANCELLED,
];

type BookingApiPayload = {
  [key: string]: unknown;
  id?: string;
  bookingId?: string;
  code?: string;
  bookingCode?: string;
  serviceCenterId?: string;
  centerId?: string;
  serviceCenter?: { id?: string; name?: string };
  serviceCenterName?: string;
  centerName?: string;
  center?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customer?: { name?: string; email?: string; phone?: string };
  vehicleType?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleVin?: string;
  vehicle?: { type?: string; brand?: string; model?: string; vin?: string };
  serviceTypeId?: string;
  serviceType?: { id?: string; name?: string };
  serviceTypeName?: string;
  technicianId?: string;
  technicianName?: string;
  technician?: { id?: string; name?: string };
  preferredTime?: string;
  preferredDateTime?: string;
  scheduledDate?: string;
  appointmentTime?: string;
  repairParts?: string;
  requestedParts?: string;
  description?: string;
  notes?: string;
  status?: BookingStatus;
  assignmentStatus?: BookingStatus;
  estimatedCost?: number;
  estimatedAmount?: number;
  actualCost?: number;
  actualAmount?: number;
  createdAt?: string;
  updatedAt?: string;
};

function mapApiBooking(payload: BookingApiPayload): Booking {
  const get = <T>(...keys: Array<string>): T | undefined => {
    for (const key of keys) {
      const value = payload[key];
      if (value !== undefined && value !== null && value !== "") {
        return value as T;
      }
    }
    return undefined;
  };

  const fallbackId = get<string>("id", "Id", "bookingId", "BookingId") ?? `booking-${Date.now()}`;
  const customer = get<{ name?: string; email?: string; phone?: string }>("customer", "Customer") ?? {};
  const vehicle = get<{ type?: string; brand?: string; model?: string; vin?: string }>("vehicle", "Vehicle") ?? {};
  const serviceCenter = get<{ id?: string; name?: string }>("serviceCenter", "ServiceCenter") ?? {};
  const technician = get<{ id?: string; name?: string }>("technician", "Technician") ?? {};

  return {
    id: fallbackId,
    bookingCode:
      get<string>("code", "Code", "bookingCode", "BookingCode") ?? undefined,
    serviceCenterId:
      get<string>("serviceCenterId", "ServiceCenterId", "centerId", "CenterId") ??
      serviceCenter.id,
    serviceCenterName:
      get<string>("serviceCenterName", "ServiceCenterName", "centerName", "CenterName", "center", "Center") ??
      serviceCenter.name,
    customerName: get<string>("customerName", "CustomerName") ?? customer.name ?? "",
    customerEmail: get<string>("customerEmail", "CustomerEmail") ?? customer.email ?? "",
    customerPhone: get<string>("customerPhone", "CustomerPhone") ?? customer.phone ?? "",
    vehicleType: get<string>("vehicleType", "VehicleType") ?? vehicle.type ?? "",
    vehicleBrand: get<string>("vehicleBrand", "VehicleBrand") ?? vehicle.brand ?? "",
    vehicleModel: get<string>("vehicleModel", "VehicleModel") ?? vehicle.model,
    vehicleVin: get<string>("vehicleVin", "VehicleVin") ?? vehicle.vin,
    serviceTypeId:
      get<string>("serviceTypeId", "ServiceTypeId") ??
      get<{ id?: string }>("serviceType", "ServiceType")?.id,
    serviceType:
      get<string>("serviceTypeName", "ServiceTypeName") ??
      get<string>("serviceType", "ServiceType") ??
      get<{ name?: string }>("serviceType", "ServiceType")?.name,
    technicianId: get<string>("technicianId", "TechnicianId") ?? technician.id,
    technicianName: get<string>("technicianName", "TechnicianName") ?? technician.name,
    preferredTime:
      get<string>("preferredTime", "PreferredTime") ??
      get<string>("preferredDateTime", "PreferredDateTime"),
    scheduledDate:
      get<string>("scheduledDate", "ScheduledDate") ??
      get<string>("appointmentTime", "AppointmentTime") ??
      get<string>("preferredTime", "PreferredTime") ??
      new Date().toISOString(),
    repairParts:
      get<string>("repairParts", "RepairParts") ??
      get<string>("requestedParts", "RequestedParts") ??
      "",
    description: get<string>("description", "Description") ?? get<string>("notes", "Notes") ?? "",
    status: (get<string>("status", "Status") as BookingStatus | undefined) ?? BookingStatus.PENDING,
    assignmentStatus:
      (get<string>("assignmentStatus", "AssignmentStatus") as BookingStatus | undefined) ??
      (get<string>("status", "Status") as BookingStatus | undefined) ??
      BookingStatus.PENDING,
    estimatedCost:
      get<number>("estimatedCost", "EstimatedCost") ??
      get<number>("estimatedAmount", "EstimatedAmount"),
    actualCost:
      get<number>("actualCost", "ActualCost") ??
      get<number>("actualAmount", "ActualAmount"),
    createdAt: get<string>("createdAt", "CreatedAt") ?? new Date().toISOString(),
    updatedAt: get<string>("updatedAt", "UpdatedAt") ?? get<string>("createdAt", "CreatedAt") ?? new Date().toISOString(),
    notes: get<string>("notes", "Notes"),
  };
}

function filterMockBookings(filters: BookingFilters): Booking[] {
  let bookings = [...mockBookings];

  if (filters.customerName) {
    bookings = bookings.filter((booking) =>
      booking.customerName.toLowerCase().includes(filters.customerName!.toLowerCase()),
    );
  }

  if (filters.phone) {
    bookings = bookings.filter((booking) => booking.customerPhone.includes(filters.phone!));
  }

  if (filters.centerId) {
    bookings = bookings.filter((booking) => booking.serviceCenterId === filters.centerId);
  }

  if (filters.status) {
    bookings = bookings.filter((booking) => booking.status === filters.status);
  }

  if (filters.assignmentStatus) {
    bookings = bookings.filter((booking) => booking.assignmentStatus === filters.assignmentStatus);
  }

  if (filters.serviceTypeId) {
    bookings = bookings.filter((booking) => booking.serviceTypeId === filters.serviceTypeId);
  } else if (filters.serviceType) {
    bookings = bookings.filter((booking) =>
      (booking.serviceType ?? "").toLowerCase().includes(filters.serviceType!.toLowerCase()),
    );
  }

  if (filters.technicianId) {
    bookings = bookings.filter((booking) => booking.technicianId === filters.technicianId);
  }

  if (filters.sort) {
    bookings.sort((a, b) => {
      const key = filters.sort! as keyof Booking;
      const aVal = a[key];
      const bVal = b[key];

      if (aVal === undefined || bVal === undefined) return 0;

      if (filters.sortOrder === "desc") {
        return (bVal as number | string) > (aVal as number | string) ? 1 : -1;
      }
      return (aVal as number | string) > (bVal as number | string) ? 1 : -1;
    });
  } else {
    bookings.sort(
      (a, b) =>
        statusOrder.indexOf(a.assignmentStatus ?? a.status) -
        statusOrder.indexOf(b.assignmentStatus ?? b.status),
    );
  }

  return bookings;
}

class BookingService {
  private async requestOrMock<T>(executor: () => Promise<T>, fallback: () => T): Promise<T> {
    if (USE_MOCK_DATA) {
      return fallback();
    }

    try {
      return await executor();
    } catch (error) {
      console.warn("[bookingService] Falling back to mock data because API call failed.", error);
      return fallback();
    }
  }

  async getBookings(filters: BookingFilters = {}): Promise<Booking[]> {
    return this.requestOrMock(async () => {
      const { data } = await api.get(BASE_PATH, { params: filters });
      return Array.isArray(data) ? data.map(mapApiBooking) : [];
    }, () => filterMockBookings(filters));
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return this.requestOrMock(async () => {
      const { data } = await api.get(`${BASE_PATH}/${id}`);
      return mapApiBooking(data);
    }, () => mockBookings.find((booking) => booking.id === id) ?? null);
  }

  async createBooking(payload: CreateBookingRequest): Promise<Booking> {
    const sanitizedPayload = {
      customerName: payload.customerName.trim(),
      customerEmail: payload.customerEmail.trim(),
      customerPhone: payload.customerPhone.trim(),
      vehicleType: payload.vehicleType.trim(),
      vehicleBrand: payload.vehicleBrand.trim(),
      vehicleModel: payload.vehicleModel?.trim(),
      vehicleVin: payload.vehicleVin?.trim(),
      serviceCenterId: payload.serviceCenterId,
      serviceTypeId: payload.serviceTypeId,
      preferredTime: payload.preferredTime,
      scheduledDate: payload.scheduledDate ?? payload.preferredTime,
      notes: payload.notes ?? payload.description,
      repairParts: payload.repairParts,
      description: payload.description,
    };

    const requestPayload = {
      ServiceCenterId: payload.serviceCenterId,
      ServiceTypeId: payload.serviceTypeId,
      PreferredTime: payload.preferredTime,
      PreferredDateTime: payload.preferredTime,
      ScheduledDate: payload.scheduledDate ?? payload.preferredTime,
      Description: payload.description,
      Notes: payload.notes ?? payload.description,
      Customer: {
        Name: payload.customerName.trim(),
        Email: payload.customerEmail.trim(),
        Phone: payload.customerPhone.trim(),
      },
      Vehicle: {
        Type: payload.vehicleType.trim(),
        Brand: payload.vehicleBrand.trim(),
        Model: payload.vehicleModel?.trim(),
        Vin: payload.vehicleVin?.trim(),
      },
      RepairParts: payload.repairParts,
    };

    return this.requestOrMock(async () => {
      const { data } = await api.post(CREATE_PATH, requestPayload);
      return mapApiBooking(data);
    }, () => {
      const newBooking: Booking = mapApiBooking({
        ...sanitizedPayload,
        id: `booking-${Date.now()}`,
        status: BookingStatus.PENDING,
        assignmentStatus: BookingStatus.PENDING,
        scheduledDate: sanitizedPayload.scheduledDate ?? sanitizedPayload.preferredTime,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        serviceCenterName:
          mockBookings.find((b) => b.serviceCenterId === payload.serviceCenterId)?.serviceCenterName ??
          payload.serviceCenter ??
          "Unknown center",
        serviceType: mockBookings.find((b) => b.serviceTypeId === payload.serviceTypeId)?.serviceType ??
          payload.serviceType ??
          "Undefined service",
      });
      mockBookings.unshift(newBooking);
      return newBooking;
    });
  }

  async updateBooking(id: string, payload: UpdateBookingRequest): Promise<Booking | null> {
    return this.requestOrMock(async () => {
      const { data } = await api.put(`${BASE_PATH}/${id}`, payload);
      return mapApiBooking(data);
    }, () => {
      const index = mockBookings.findIndex((booking) => booking.id === id);
      if (index === -1) return null;

      mockBookings[index] = {
        ...mockBookings[index],
        ...payload,
        serviceCenterId: payload.serviceCenterId ?? mockBookings[index].serviceCenterId,
        serviceTypeId: payload.serviceTypeId ?? mockBookings[index].serviceTypeId,
        preferredTime: payload.preferredTime ?? mockBookings[index].preferredTime,
        scheduledDate: payload.scheduledDate ?? mockBookings[index].scheduledDate,
        status: payload.status ?? mockBookings[index].status,
        assignmentStatus: payload.assignmentStatus ?? mockBookings[index].assignmentStatus,
        updatedAt: new Date().toISOString(),
      };

      return mockBookings[index];
    });
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    return this.requestOrMock(async () => {
      const { data } = await api.patch(`${BASE_PATH}/${id}/status`, { status });
      return mapApiBooking(data);
    }, async () => this.updateBooking(id, { status }));
  }

  async deleteBooking(id: string): Promise<boolean> {
    return this.requestOrMock(async () => {
      await api.delete(`${BASE_PATH}/${id}`);
      return true;
    }, () => {
      const index = mockBookings.findIndex((booking) => booking.id === id);
      if (index === -1) return false;
      mockBookings.splice(index, 1);
      return true;
    });
  }

  async getBookingStats(): Promise<{
    total: number;
    pending: number;
    assigned: number;
    inQueue: number;
    active: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> {
    return this.requestOrMock(async () => {
      const { data } = await api.get(`${BASE_PATH}/stats`);
      return {
        total: data.total ?? 0,
        pending: data.pending ?? 0,
        assigned: data.assigned ?? data.Assigned ?? 0,
        inQueue: data.inQueue ?? data.in_queue ?? 0,
        active: data.active ?? 0,
        confirmed: data.confirmed ?? 0,
        inProgress: data.inProgress ?? data.in_progress ?? 0,
        completed: data.completed ?? 0,
        cancelled: data.cancelled ?? 0,
      };
    }, () => ({
      total: mockBookings.length,
      pending: mockBookings.filter((b) => (b.assignmentStatus ?? b.status) === BookingStatus.PENDING).length,
      assigned: mockBookings.filter((b) => (b.assignmentStatus ?? b.status) === BookingStatus.ASSIGNED).length,
      inQueue: mockBookings.filter((b) => (b.assignmentStatus ?? b.status) === BookingStatus.IN_QUEUE).length,
      active: mockBookings.filter((b) => (b.assignmentStatus ?? b.status) === BookingStatus.ACTIVE).length,
      confirmed: mockBookings.filter((b) => b.status === BookingStatus.CONFIRMED).length,
      inProgress: mockBookings.filter((b) => b.status === BookingStatus.IN_PROGRESS).length,
      completed: mockBookings.filter((b) => b.status === BookingStatus.COMPLETED).length,
      cancelled: mockBookings.filter((b) => b.status === BookingStatus.CANCELLED).length,
    }));
  }
}

export const bookingService = new BookingService();
