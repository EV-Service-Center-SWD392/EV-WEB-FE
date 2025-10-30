import {
  Booking,
  BookingStatus,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingFilters,
} from "@/entities/booking.types";

// Mock data for bookings
const mockBookings: Booking[] = [
  {
    id: "1",
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@email.com",
    customerPhone: "0901234567",
    vehicleType: "Xe máy điện",
    vehicleBrand: "VinFast",
    serviceCenter: "Trung tâm Quận 1",
    technicianId: "tech001",
    technicianName: "Trần Văn B",
    scheduledDate: "2024-01-15T09:00:00Z",
    repairParts: "Pin, Motor",
    description: "Thay pin và kiểm tra motor",
    status: BookingStatus.PENDING,
    estimatedCost: 2000000,
    actualCost: 1950000,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "2",
    customerName: "Lê Thị C",
    customerEmail: "lethic@email.com",
    customerPhone: "0912345678",
    vehicleType: "Ô tô điện",
    vehicleBrand: "Tesla",
    serviceCenter: "Trung tâm Quận 7",
    technicianId: "tech002",
    technicianName: "Phạm Văn D",
    scheduledDate: "2024-01-16T14:00:00Z",
    repairParts: "Hệ thống sạc",
    description: "Sửa chữa hệ thống sạc nhanh",
    status: BookingStatus.CONFIRMED,
    estimatedCost: 5000000,
    createdAt: "2024-01-11T10:00:00Z",
    updatedAt: "2024-01-12T15:00:00Z",
  },
  {
    id: "3",
    customerName: "Hoàng Văn E",
    customerEmail: "hoangvane@email.com",
    customerPhone: "0923456789",
    vehicleType: "Xe đạp điện",
    vehicleBrand: "Pega",
    serviceCenter: "Trung tâm Quận 3",
    technicianId: "tech003",
    technicianName: "Ngô Thị F",
    scheduledDate: "2024-01-17T10:30:00Z",
    repairParts: "Phanh, Đèn LED",
    description: "Thay phanh và sửa đèn LED",
    status: BookingStatus.IN_PROGRESS,
    estimatedCost: 800000,
    actualCost: 750000,
    createdAt: "2024-01-12T09:30:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
  },
  {
    id: "4",
    customerName: "Vũ Thị G",
    customerEmail: "vuthig@email.com",
    customerPhone: "0934567890",
    vehicleType: "Xe máy điện",
    vehicleBrand: "Gogoro",
    serviceCenter: "Trung tâm Quận 5",
    technicianId: "tech001",
    technicianName: "Trần Văn B",
    scheduledDate: "2024-01-14T16:00:00Z",
    repairParts: "Lốp xe, Phanh",
    description: "Thay lốp và kiểm tra hệ thống phanh",
    status: BookingStatus.COMPLETED,
    estimatedCost: 1200000,
    actualCost: 1150000,
    createdAt: "2024-01-08T14:20:00Z",
    updatedAt: "2024-01-14T17:00:00Z",
  },
  {
    id: "5",
    customerName: "Đặng Văn H",
    customerEmail: "dangvanh@email.com",
    customerPhone: "0945678901",
    vehicleType: "Ô tô điện",
    vehicleBrand: "VinFast VF8",
    serviceCenter: "Trung tâm Quận 2",
    scheduledDate: "2024-01-20T11:00:00Z",
    repairParts: "Camera, Cảm biến",
    description: "Hiệu chỉnh camera và cảm biến tự động",
    status: BookingStatus.CANCELLED,
    estimatedCost: 3000000,
    createdAt: "2024-01-13T16:45:00Z",
    updatedAt: "2024-01-13T18:00:00Z",
  },
];

class BookingService {
  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get all bookings with optional filters
  async getBookings(filters: BookingFilters = {}): Promise<Booking[]> {
    await this.delay();

    let filteredBookings = [...mockBookings];

    // Apply filters
    if (filters.customerName) {
      filteredBookings = filteredBookings.filter((booking) =>
        booking.customerName
          .toLowerCase()
          .includes(filters.customerName!.toLowerCase())
      );
    }

    if (filters.phone) {
      filteredBookings = filteredBookings.filter((booking) =>
        booking.customerPhone.includes(filters.phone!)
      );
    }

    if (filters.status) {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.status === filters.status
      );
    }

    if (filters.serviceType) {
      filteredBookings = filteredBookings.filter((booking) =>
        booking.repairParts
          .toLowerCase()
          .includes(filters.serviceType!.toLowerCase())
      );
    }

    if (filters.technicianId) {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.technicianId === filters.technicianId
      );
    }

    // Apply sorting
    if (filters.sort) {
      filteredBookings.sort((a, b) => {
        const aVal = a[filters.sort! as keyof Booking];
        const bVal = b[filters.sort! as keyof Booking];

        if (!aVal || !bVal) return 0;

        if (filters.sortOrder === "desc") {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    return filteredBookings;
  }

  // Get booking by ID
  async getBookingById(id: string): Promise<Booking | null> {
    await this.delay();
    return mockBookings.find((booking) => booking.id === id) || null;
  }

  // Create new booking
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    await this.delay();

    const newBooking: Booking = {
      id: `booking_${Date.now()}`,
      ...data,
      status: BookingStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockBookings.unshift(newBooking);
    return newBooking;
  }

  // Update booking
  async updateBooking(
    id: string,
    data: UpdateBookingRequest
  ): Promise<Booking | null> {
    await this.delay();

    const index = mockBookings.findIndex((booking) => booking.id === id);
    if (index === -1) return null;

    mockBookings[index] = {
      ...mockBookings[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return mockBookings[index];
  }

  // Delete booking
  async deleteBooking(id: string): Promise<boolean> {
    await this.delay();

    const index = mockBookings.findIndex((booking) => booking.id === id);
    if (index === -1) return false;

    mockBookings.splice(index, 1);
    return true;
  }

  // Get booking statistics
  async getBookingStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> {
    await this.delay();

    return {
      total: mockBookings.length,
      pending: mockBookings.filter((b) => b.status === BookingStatus.PENDING)
        .length,
      confirmed: mockBookings.filter(
        (b) => b.status === BookingStatus.CONFIRMED
      ).length,
      inProgress: mockBookings.filter(
        (b) => b.status === BookingStatus.IN_PROGRESS
      ).length,
      completed: mockBookings.filter(
        (b) => b.status === BookingStatus.COMPLETED
      ).length,
      cancelled: mockBookings.filter(
        (b) => b.status === BookingStatus.CANCELLED
      ).length,
    };
  }
}

export const bookingService = new BookingService();
