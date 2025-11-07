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
                ? `/client/Booking?${queryString}`
                : "/client/Booking";

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
                "/client/Booking",
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
                `/client/Booking/${bookingId}`,
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
            await api.delete(`/client/Booking/${bookingId}`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error("Failed to delete booking:", err);
            throw new Error(err.message || "Failed to delete booking");
        }
    },
};

export default bookingService;
