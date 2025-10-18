import { Booking, BookingStatus, Slot } from "@/entities/booking.types";

// DTO (Data Transfer Object) cho việc tạo booking
export interface CreateBookingPayload {
  vehicleId: string;
  slotId: string;
  initialServiceIds: string[]; // Các dịch vụ member chọn ban đầu, e.g., ["khám tổng quát"]
  notes?: string;
}

// --- MOCK DATA (KHỚP VỚI SCHEMA CỦA BẠN) ---
const MOCK_SLOTS: Slot[] = [
  {
    id: "slot_1",
    centerId: "center_1",
    startUtc: "2025-10-20T02:00:00Z",
    endUtc: "2025-10-20T03:00:00Z",
    capacity: 5,
    status: "OPEN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "slot_2",
    centerId: "center_1",
    startUtc: "2025-10-20T03:00:00Z",
    endUtc: "2025-10-20T04:00:00Z",
    capacity: 5,
    status: "OPEN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "booking_1",
    customerId: "user_123",
    vehicleId: "vehicle_abc",
    slotId: "slot_1",
    status: "CONFIRMED",
    createdAt: "2025-10-16T10:00:00Z",
    updatedAt: "2025-10-16T11:00:00Z",
  },
  {
    id: "booking_2",
    customerId: "user_123",
    vehicleId: "vehicle_xyz",
    slotId: "slot_2",
    status: "PENDING",
    createdAt: "2025-10-17T09:00:00Z",
    updatedAt: "2025-10-17T09:00:00Z",
  },
];
// --- END MOCK DATA ---

class BookingService {
  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Lấy danh sách booking của member đang đăng nhập
  async getMyBookings(): Promise<Booking[]> {
    await this.delay();
    // Khi có BE: return api.get('/bookings/me');
    console.log("SERVICE: Fetching my bookings...");
    return MOCK_BOOKINGS.filter((b) => b.customerId === "user_123");
  }

  // Lấy chi tiết một booking
  async getBookingById(id: string): Promise<Booking | undefined> {
    await this.delay();
    // Khi có BE: return api.get(`/bookings/${id}`);
    console.log(`SERVICE: Fetching booking by id ${id}...`);
    return MOCK_BOOKINGS.find((booking) => booking.id === id);
  }

  // Member tạo một yêu cầu booking mới
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    await this.delay(1000);
    // Khi có BE: return api.post('/bookings', payload);
    console.log("SERVICE: Creating booking with payload:", payload);

    const newBooking: Booking = {
      id: `booking_${Date.now()}`,
      customerId: "user_123", // Lấy từ auth state
      status: "PENDING", // Status ban đầu luôn là PENDING chờ staff duyệt
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: payload.notes,
      vehicleId: payload.vehicleId,
      slotId: payload.slotId,
    };

    MOCK_BOOKINGS.unshift(newBooking);
    return newBooking;
  }
}

export const bookingService = new BookingService();
