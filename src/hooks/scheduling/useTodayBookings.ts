import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { BookingStatus, type Booking, type BookingResponseDto } from "@/entities/booking.types";
import { bookingService } from "@/services/bookingService";

/**
 * Hook to fetch today's bookings for a specific center
 * Read-only access to existing bookingService
 */
export function useTodayBookings(
    centerId: string | null,
    date: string
): UseQueryResult<BookingResponseDto[], Error> {
    return useQuery({
        queryKey: ["bookings", "today", centerId, date],
        queryFn: async () => {
            // Fetch bookings with filters
            const bookings = await bookingService.getClientBookings({
                // Assuming bookingService supports these filters
                // Adjust based on actual bookingService implementation
            });

            // Filter by date and center on client side if API doesn't support it
            return bookings.filter((booking) => {
                const bookingDate = new Date(booking.preferredDate ?? booking.createdAt).toISOString().split("T")[0];
                const matchesDate = bookingDate === date;
                // Filter by service center if needed
                const matchesCenter = !centerId || booking.serviceCenterName === centerId;
                return matchesDate && matchesCenter;
            });
        },
        enabled: !!centerId && !!date,
        staleTime: 2 * 60 * 1000, // 2 minutes - fresher data for today
        refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    });
}

/**
 * Hook to get assignable bookings (filtered by status)
 * These are bookings that can be assigned to technicians
 */
export function useAssignableBookings(
    centerId: string | null,
    date: string
): UseQueryResult<BookingResponseDto[], Error> {
    return useQuery({
        queryKey: ["bookings", "assignable", centerId, date],
        queryFn: async () => {
            const bookings = await bookingService.getClientBookings({});

            // Filter by date, center, and assignable statuses
            return bookings.filter((booking) => {
                const bookingDate = new Date(booking.preferredDate ?? booking.createdAt).toISOString().split("T")[0];
                const isToday = bookingDate === date;

                // Only bookings that are Approved can be assigned
                const isAssignable = booking.status === "Approved";

                const matchesCenter = !centerId || booking.serviceCenterName === centerId;

                return isToday && isAssignable && matchesCenter;
            });
        },
        enabled: !!centerId && !!date,
        staleTime: 2 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
    });
}
