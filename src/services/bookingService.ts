import { api } from "@/services/api";
import type {
    BookingQueryDto,
    BookingResponseDto,
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
};

export default bookingService;
