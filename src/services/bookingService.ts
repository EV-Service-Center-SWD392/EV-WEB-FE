import { api } from "@/services/api";
import type {
    Booking,
    BookingStatus,
    CreateBookingRequest,
    UpdateBookingRequest,
    BookingFilters,
} from "@/entities/booking.types";

const BASE_PATH = "/api/bookings";

/**
 * BookingService
 * Handles CRUD operations for bookings
 */
export const bookingService = {
    /**
     * Get all bookings with optional filters
     */
    async getBookings(filters?: BookingFilters): Promise<Booking[]> {
        try {
            const response = await api.get<Booking[]>(BASE_PATH, {
                params: filters,
            });
            return response.data || [];
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error("Failed to fetch bookings:", err);
            throw new Error(err.message || "Failed to fetch bookings");
        }
    },

    /**
     * Get a single booking by ID
     */
    async getBookingById(id: string): Promise<Booking> {
        try {
            const response = await api.get<Booking>(`${BASE_PATH}/${id}`);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error(`Failed to fetch booking ${id}:`, err);
            throw new Error(err.message || "Failed to fetch booking");
        }
    },

    /**
     * Create a new booking
     */
    async createBooking(data: CreateBookingRequest): Promise<Booking> {
        try {
            const response = await api.post<Booking>(BASE_PATH, data);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error("Failed to create booking:", err);
            throw new Error(err.message || "Failed to create booking");
        }
    },

    /**
     * Update an existing booking
     */
    async updateBooking(
        id: string,
        data: UpdateBookingRequest
    ): Promise<Booking> {
        try {
            const response = await api.patch<Booking>(`${BASE_PATH}/${id}`, data);
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error(`Failed to update booking ${id}:`, err);
            throw new Error(err.message || "Failed to update booking");
        }
    },

    /**
     * Delete a booking
     */
    async deleteBooking(id: string): Promise<void> {
        try {
            await api.delete(`${BASE_PATH}/${id}`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error(`Failed to delete booking ${id}:`, err);
            throw new Error(err.message || "Failed to delete booking");
        }
    },

    /**
     * Update booking status
     */
    async updateBookingStatus(
        id: string,
        status: BookingStatus
    ): Promise<Booking> {
        try {
            const response = await api.patch<Booking>(`${BASE_PATH}/${id}/status`, {
                status,
            });
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error(`Failed to update booking status ${id}:`, err);
            throw new Error(err.message || "Failed to update booking status");
        }
    },

    /**
     * Get bookings by customer ID
     */
    async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
        try {
            const response = await api.get<Booking[]>(`${BASE_PATH}/customer/${customerId}`);
            return response.data || [];
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error(`Failed to fetch bookings for customer ${customerId}:`, err);
            throw new Error(err.message || "Failed to fetch customer bookings");
        }
    },

    /**
     * Get bookings by technician ID
     */
    async getBookingsByTechnician(technicianId: string): Promise<Booking[]> {
        try {
            const response = await api.get<Booking[]>(`${BASE_PATH}/technician/${technicianId}`);
            return response.data || [];
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            console.error(`Failed to fetch bookings for technician ${technicianId}:`, err);
            throw new Error(err.message || "Failed to fetch technician bookings");
        }
    },
};

export default bookingService;
