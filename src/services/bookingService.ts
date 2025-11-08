import { BookingStatus, BookingRecord } from "@/entities/booking.types";
import type {
  BookingFilters,
  UpdateBookingRequest,
} from "@/entities/booking.types";

// Helper: prefer globalThis.window checks to avoid SSR errors
function safeGetAccessToken(): string | null {
  try {
    if (globalThis.window === undefined) return null;
    return globalThis.localStorage.getItem("access_token");
  } catch {
    return null;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export class BookingService {
  private readonly apiBase = API_BASE;

  private delay(ms = 300) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // Return auth headers if a token exists; safe for SSR
  private getAuthHeaders(): Record<string, string> {
    const token = safeGetAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // List bookings (remote only)
  async getBookings(filters: BookingFilters = {}): Promise<BookingRecord[]> {
    if (this.apiBase) {
      try {
        const url = `${this.apiBase.replace(/\/$/, "")}/client/Booking`;
        const res = await axios.get(url, {
          params: filters as any,
          headers: {
            Accept: "application/json",
            ...this.getAuthHeaders(),
          },
          timeout: 5000,
        });
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        if (Array.isArray(data?.rows)) return data.rows;
      } catch (err) {
        console.debug("bookingService.getBookings remote failed", err);
      }
    }
    return [];
  }

  async getBookingById(id: string): Promise<BookingRecord | null> {
    if (this.apiBase) {
      try {
        const url = `${this.apiBase.replace(/\/$/, "")}/client/Booking/${encodeURIComponent(id)}`;
        const res = await axios.get(url, {
          headers: { Accept: "application/json", ...this.getAuthHeaders() },
          timeout: 5000,
        });
        return res.data || null;
      } catch {
        // remote failed
      }
    }
    return null;
  }

  // Create booking: remote only
  async createBooking(data: any): Promise<any> {
    if (this.apiBase) {
      try {
        const payload = {
          bookingDate:
            data.bookingDate || data.scheduledDate || new Date().toISOString(),
          slot: Number(data.slot ?? data.slotId ?? 0),
          vehicleId: data.vehicleId || data.vehicle?.vehicleId || "",
          notes: data.notes || data.description || "",
          centerId:
            data.centerId || data.serviceCenterId || data.serviceCenter || "",
        };
        const url = `${this.apiBase.replace(/\/$/, "")}/client/Booking`;
        const res = await axios.post(url, payload, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...this.getAuthHeaders(),
          },
          timeout: 5000,
        });
        return res.data;
      } catch (err) {
        console.debug("bookingService.createBooking remote failed", err);
      }
    }
    return null;
  }

  async getMyBookings(): Promise<BookingRecord[]> {
    return this.getBookings();
  }

  async getCenters(): Promise<any[]> {
    if (!this.apiBase) return [];
    try {
      const url = `${this.apiBase.replace(/\/$/, "")}/Center`;
      const res = await axios.get(url, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
          ...this.getAuthHeaders(),
        },
        timeout: 5000,
      });
      const data = res.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async getVehicle(): Promise<any[]> {
    if (!this.apiBase) return [];
    try {
      const url = `${this.apiBase.replace(/\/$/, "")}/client/Vehicle?Page=1&PageSize=10`;
      const res = await axios.get(url, {
        headers: { Accept: "application/json", ...this.getAuthHeaders() },
        timeout: 5000,
      });
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(data?.rows)) return data.rows;
      return [];
    } catch (err) {
      return [];
    }
  }

  async getBookingSchedule(
    centerId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    if (!centerId) return [];

        try {
            const params = new URLSearchParams();
            if (startDate) params.append("StartDate", startDate);
            if (endDate) params.append("EndDate", endDate);

            const queryString = params.toString();
            const url = queryString
                ? `/api/BookingSchedules/client/${centerId}?${queryString}`
                : `/api/BookingSchedules/client/${centerId}`;

            const response = await api.get(url);
            const data = response.data;

            // If API returns flat array of slots
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.items)) return data.items;

            // If API returns nested structure with schedules
            if (data?.schedules && Array.isArray(data.schedules)) {
                const flat: any[] = [];
                data.schedules.forEach((d: any) => {
                    const date = d.currentDate;
                    const slots = Array.isArray(d.slots) ? d.slots : [];
                    slots.forEach((slot: any, idx: number) => {
                        flat.push({
                            slotId: slot.slotId ?? `${centerId}_${date}_${slot.slot ?? idx}`,
                            centerId: data.centerId || centerId,
                            startUtc: `${date}T${slot.startutc || slot.startUtc || "00:00"}:00Z`,
                            endUtc: `${date}T${slot.endutc || slot.endUtc || "00:00"}:00Z`,
                            capacity: slot.capacity,
                            note: slot.note,
                            status: slot.status,
                            isActive: slot.isActive,
                            isBookable: slot.isBookable,
                            raw: slot,
                        });
                    });
                });
                return flat;
            }

            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Failed to fetch booking schedule:", error);
            return [];
        }
    },
};

export const bookingService = new BookingService();
