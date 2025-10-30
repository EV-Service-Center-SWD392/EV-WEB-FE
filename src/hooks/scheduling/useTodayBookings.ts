import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { BookingStatus, type Booking } from "@/entities/booking.types";
import { bookingService } from "@/services/bookingService";

/**
 * Hook to fetch today's bookings for a specific center
 * Read-only access to existing bookingService
 */
export function useTodayBookings(
    centerId: string | null,
    date: string
): UseQueryResult<Booking[], Error> {
    return useQuery({
        queryKey: ["bookings", "today", centerId, date],
        queryFn: async () => {
            // Fetch bookings with filters
            const bookings = await bookingService.getBookings({
                // Assuming bookingService supports these filters
                // Adjust based on actual bookingService implementation
            });

            // Filter by date and center on client side if API doesn't support it
            return bookings.filter((booking) => {
                const bookingDate = new Date(booking.scheduledDate).toISOString().split("T")[0];
                const matchesDate = bookingDate === date;
                // Filter by service center if needed
                const matchesCenter = !centerId || booking.serviceCenter === centerId;
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
): UseQueryResult<Booking[], Error> {
    return useQuery({
        queryKey: ["bookings", "assignable", centerId, date],
        queryFn: async () => {
            const bookings = await bookingService.getBookings({});

            // Filter by date, center, and assignable statuses
            return bookings.filter((booking) => {
                const bookingDate = new Date(booking.scheduledDate).toISOString().split("T")[0];
                const isToday = bookingDate === date;

                // Only bookings that are Confirmed can be assigned
                // (PENDING bookings are not ready, IN_PROGRESS/COMPLETED/CANCELLED are done)
                const isAssignable =
                    booking.status === BookingStatus.CONFIRMED;

                const matchesCenter = !centerId || booking.serviceCenter === centerId;

                return isToday && isAssignable && matchesCenter;
            });
        },
        enabled: !!centerId && !!date,
        staleTime: 2 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
    });
}
