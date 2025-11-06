import { api } from "./api";
import type {
    BookingApprovalDto,
    ApproveBookingDto,
    RejectBookingDto,
    BookingApprovalFilters,
    UUID,
} from "@/entities/booking-approval.types";

const BASE_PATH = "/BookingApproval";

/**
 * BookingApproval Service
 * 
 * All endpoints require Authorization: Bearer <JWT>
 * Staff ID is automatically extracted from JWT claims (ClaimTypes.NameIdentifier)
 * All times are in UTC (ISO 8601 format ending with Z)
 */
export const bookingApprovalService = {
    /**
     * GET /api/BookingApproval/{id}
     * Load booking details for review
     * 
     * @returns 200 + BookingApprovalDto or 404 + error message
     */
    async getBookingById(id: UUID): Promise<BookingApprovalDto> {
        try {
            const response = await api.get<BookingApprovalDto>(`${BASE_PATH}/${id}`);
            return response.data;
        } catch (error: unknown) {
            // Handle 404 or other errors
            const err = error as { response?: { data?: unknown }; message?: string };
            const message = err.response?.data || err.message || "Failed to fetch booking";
            throw new Error(typeof message === 'string' ? message : 'Booking not found');
        }
    },

    /**
     * GET /api/BookingApproval/pending
     * Get all pending/requested bookings with optional filters
     * 
     * @param filters - Optional centerId and/or date (YYYY-MM-DD)
     * @returns 200 + array of BookingApprovalDto (empty if none)
     */
    async getPendingBookings(
        filters?: BookingApprovalFilters
    ): Promise<BookingApprovalDto[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.centerId) {
                params.append("centerId", filters.centerId);
            }
            if (filters?.date) {
                params.append("date", filters.date);
            }

            const response = await api.get<BookingApprovalDto[]>(
                `${BASE_PATH}/pending${params.toString() ? `?${params.toString()}` : ""}`
            );

            return response.data || [];
        } catch (error: unknown) {
            const err = error as { response?: { data?: unknown }; message?: string };
            const message = err.response?.data || err.message || "Failed to fetch pending bookings";
            throw new Error(typeof message === 'string' ? message : 'Failed to fetch pending bookings');
        }
    },

    /**
     * POST /api/BookingApproval/approve
     * Approve a pending booking
     * 
     * Validations:
     * - Booking must exist and have status PENDING or REQUESTED
     * - Must have valid time slot with center
     * - No time slot conflicts with other APPROVED bookings
     * 
     * @returns 200 + updated BookingApprovalDto with approvedBy/approvedAt
     * @throws 400 for validation errors (conflict, invalid status, etc.)
     * @throws 401 if JWT is invalid/missing
     */
    async approveBooking(data: ApproveBookingDto): Promise<BookingApprovalDto> {
        try {
            const response = await api.post<BookingApprovalDto>(
                `${BASE_PATH}/approve`,
                data
            );
            return response.data;
        } catch (error: unknown) {
            // Error messages from backend:
            // - "BookingId is required"
            // - "Booking not found"
            // - "Only pending bookings can be approved"
            // - "Booking must include a preferred time window"
            // - "PreferredStartUtc must be earlier than PreferredEndUtc"
            // - "Time slot conflict at center"
            const err = error as { response?: { data?: unknown }; message?: string };
            const message = err.response?.data || err.message || "Failed to approve booking";
            throw new Error(typeof message === 'string' ? message : 'Failed to approve booking');
        }
    },

    /**
     * POST /api/BookingApproval/reject
     * Reject a pending booking with a reason
     * 
     * Validations:
     * - Booking must exist and have status PENDING or REQUESTED
     * - Reason is required
     * 
     * @returns 200 + updated BookingApprovalDto with rejectedBy/rejectedAt/rejectReason
     * @throws 400 for validation errors
     * @throws 401 if JWT is invalid/missing
     */
    async rejectBooking(data: RejectBookingDto): Promise<BookingApprovalDto> {
        try {
            const response = await api.post<BookingApprovalDto>(
                `${BASE_PATH}/reject`,
                data
            );
            return response.data;
        } catch (error: unknown) {
            // Error messages from backend:
            // - "BookingId is required"
            // - "Booking not found"
            // - "Only pending bookings can be rejected"
            // - "Reject reason is required"
            const err = error as { response?: { data?: unknown }; message?: string };
            const message = err.response?.data || err.message || "Failed to reject booking";
            throw new Error(typeof message === 'string' ? message : 'Failed to reject booking');
        }
    },
};
