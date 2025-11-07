import { api } from "@/services/api";
import type {
    BookingQueryDto,
    BookingResponseDto,
    CreateBookingRequest,
} from "@/entities/booking.types";

const BASE_PATH = "/api/bookings";

/**
 * BookingService
 * Handles CRUD operations for bookings
 */
export const bookingService = {
    async getClientBookings(query?: BookingQueryDto): Promise<BookingResponseDto[]> {
        try {
            const params = new URLSearchParams();

            if (query?.page) params.append("page", query.page.toString());
            if (query?.pageSize) params.append("pageSize", query.pageSize.toString());
            if (query?.centerId) params.append("centerId", query.centerId);
            if (query?.vehicleId) params.append("vehicleId", query.vehicleId);
            if (query?.status) params.append("status", query.status);
            if (query?.fromDate) params.append("fromDate", query.fromDate);
            if (query?.toDate) params.append("toDate", query.toDate);

            const queryString = params.toString();
            const url = queryString
                ? `/api/client/Booking?${queryString}`
                : "/api/client/Booking";

            const response = await api.get<BookingResponseDto[]>(url);
            return response.data || [];
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error("Failed to fetch client bookings:", err);
            throw new Error(err.message || "Failed to fetch client bookings");
        }
    },

    /**
     * Create a new booking
     * POST /client/Booking
     */
    async createBooking(bookingData: CreateBookingRequest): Promise<BookingResponseDto> {
        try {
            const response = await api.post<BookingResponseDto>(
                "/api/client/Booking",
                bookingData
            );
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error("Failed to create booking:", err);
            throw new Error(err.message || "Failed to create booking");
        }
    },

    /**
     * Update booking details
     * PUT /client/Booking/{id}
     */
    async updateBooking(
        bookingId: string,
        updateData: {
            technicianId?: string;
            assignmentStatus?: string;
            status?: string;
            scheduledDate?: string;
            notes?: string;
        }
    ): Promise<BookingResponseDto> {
        try {
            const response = await api.put<BookingResponseDto>(
                `/api/client/Booking/${bookingId}`,
                updateData
            );
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error("Failed to update booking:", err);
            throw new Error(err.message || "Failed to update booking");
        }
    },

    /**
     * Delete a booking
     * DELETE /client/Booking/{id}
     */
    async deleteBooking(bookingId: string): Promise<void> {
        try {
            await api.delete(`/api/client/Booking/${bookingId}`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error("Failed to delete booking:", err);
            throw new Error(err.message || "Failed to delete booking");
        }
    },

    // ============ Helper methods for member booking flow ============

    /**
     * Alias for getClientBookings - backward compatibility
     */
    async getBookings(query?: BookingQueryDto): Promise<BookingResponseDto[]> {
        return this.getClientBookings(query);
    },

    /**
     * Alias for getClientBookings - for member bookings
     */
    async getMyBookings(query?: BookingQueryDto): Promise<BookingResponseDto[]> {
        return this.getClientBookings(query);
    },

    /**
     * Get booking by ID
     * GET /client/Booking/{id}
     */
    async getBookingById(id: string): Promise<BookingResponseDto | null> {
        try {
            const response = await api.get(`/api/client/Booking/${id}`);
            return response.data || null;
        } catch (error) {
            console.error("Failed to fetch booking:", error);
            return null;
        }
    },

    /**
     * Get all vehicles for current user
     * GET /client/Vehicle
     */
    async getVehicle(): Promise<any[]> {
        try {
            const response = await api.get("/api/client/Vehicle?Page=1&PageSize=10");
            const data = response.data;
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.items)) return data.items;
            if (Array.isArray(data?.rows)) return data.rows;
            return [];
        } catch (error) {
            console.error("Failed to fetch vehicles:", error);
            return [];
        }
    },

    /**
     * Get all service centers
     * GET /Center
     */
    async getCenters(): Promise<any[]> {
        try {
            const response = await api.get("/api/Center");
            const data = response.data;
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Failed to fetch centers:", error);
            return [];
        }
    },

    /**
     * Get booking schedule for a center
     * GET /BookingSchedules/client/{centerId}
     */
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

export default bookingService;
