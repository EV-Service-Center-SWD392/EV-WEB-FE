import { BookingStatus, BookingRecord } from "@/entities/booking.types";
import BOOKINGS_JSON from "../mockData/bookings.json";
import axios from "axios";

// Basic normalizer for status: ensure it matches BookingStatus values
function normalizeStatus(s?: string): BookingStatus {
  const val = (s || "PENDING").toUpperCase();
  if (val.includes("COMPLET")) return "COMPLETED";
  if (val.includes("CANCEL")) return "CANCELLED";
  if (val.includes("IN_PROGRESS") || val.includes("IN PROGRESS"))
    return "IN_PROGRESS";
  if (val.includes("CONFIR")) return "CONFIRMED";
  if (val.includes("PENDING") || !val) return "PENDING";
  return "PENDING";
}

// In-memory normalized booking store using new minimal booking schema
const mockBookings: BookingRecord[] = (BOOKINGS_JSON as any[]).map((b) => {
  const createdAt = b.createAt || new Date().toISOString();
  const normalized: BookingRecord = {
    bookingId: b.bookingId || `bk_${Date.now()}`,
    customerId: b.customerId || "mock-customer",
    vehicleId: b.vehicleId || "",
    slotId: b.slotId || undefined,
    notes: b.notes || undefined,
    status: normalizeStatus(b.status),
    isActive: typeof b.isActive === "boolean" ? b.isActive : true,
    createAt: createdAt,
    updateAt: b.updateAt || createdAt,
  };
  return normalized;
});

class BookingService {
  private delay(ms = 300) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // Return normalized bookings, allow simple filtering by status
  async getBookings(filters: any = {}): Promise<any[]> {
    await this.delay();
    let list = [...mockBookings];
    if (filters.status) {
      list = list.filter((b) => b.status === filters.status);
    }
    return list;
  }

  async getBookingById(id: string): Promise<any | null> {
    await this.delay();
    return mockBookings.find((b) => b.bookingId === id) || null;
  }

  // Create a booking in-memory
  async createBooking(data: any): Promise<any> {
    await this.delay();
    const now = new Date().toISOString();
    const newBooking: BookingRecord = {
      bookingId: `bk_${Date.now()}`,
      customerId: data.customerId || "mock-customer",
      vehicleId: data.vehicleId || data.vehicle?.vehicleId || "",
      slotId: data.slotId || data.scheduleId || undefined,
      notes: data.notes || undefined,
      status: "PENDING",
      isActive: true,
      createAt: now,
      updateAt: now,
    };
    mockBookings.unshift(newBooking);
    return newBooking;
  }

  // Convenience wrapper used by hooks expecting getMyBookings
  async getMyBookings(): Promise<any[]> {
    return this.getBookings();
  }

  async updateBooking(id: string, data: any): Promise<any | null> {
    await this.delay();
    const idx = mockBookings.findIndex((b) => b.bookingId === id);
    if (idx === -1) return null;
    mockBookings[idx] = {
      ...mockBookings[idx],
      ...data,
      updateAt: new Date().toISOString(),
    };
    return mockBookings[idx];
  }

  async deleteBooking(id: string): Promise<boolean> {
    await this.delay();
    const idx = mockBookings.findIndex((b) => b.bookingId === id);
    if (idx === -1) return false;
    mockBookings.splice(idx, 1);
    return true;
  }

  // Fetch centers from external API set by NEXT_PUBLIC_API_BASE_URL
  async getCenters(): Promise<any[]> {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base) return [];
    try {
      const url = `${base.replace(/\/$/, "")}/api/Center`;
      const res = await axios.get(url, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
        timeout: 5000,
      });
      const data = res.data;
      return Array.isArray(data) ? data : [];
    } catch {
      // swallow and return empty list in dev
      return [];
    }
  }
}

export const bookingService = new BookingService();
