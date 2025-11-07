import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { BookingStatus, type Booking } from "@/entities/booking.types";

/**
 * Unified type for work items that can be assigned to technicians
 */
export interface AssignableWorkItem {
    id: string;
    type: "booking" | "request";
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    vehicleInfo: string;
    services: string;
    scheduledTime?: string;
    timeWindow?: string;
    status: string;
    priority?: number;
    suggestedTechId?: string;
}

/**
 * Hook to get all assignable work items
 * Combines bookings and service requests that are ready for technician assignment
 */
export function useAssignableWork(
    centerId: string | null,
    date: string
): UseQueryResult<AssignableWorkItem[], Error> {
    return useQuery({
        queryKey: ["assignable-work", centerId, date],
        queryFn: async () => {
            const [{ bookingService }, { getMockAssignableWork }] = await Promise.all([
                import("@/services/bookingService"),
                import("@/lib/mockData/schedulingMockData"),
            ]);

            const [bookings, mockRequests] = await Promise.all([
                bookingService.getClientBookings({}),
                getMockAssignableWork(centerId!, date),
            ]);

            const bookingItems = bookings
                .filter((booking) => {
                    const bookingDate = new Date(booking.preferredDate ?? booking.createdAt)
                        .toISOString()
                        .split("T")[0];
                    const matchesDate = bookingDate === date;
                    const matchesCenter =
                        !centerId || booking.serviceCenterId === centerId;
                    return matchesDate && matchesCenter;
                })
                .map(transformBookingToWorkItem);

            const requestItems = mockRequests
                .filter((item) => item.type === "request")
                .map((item) => ({
                    ...item,
                    status: item.status ?? "Validated",
                }));

            return [...bookingItems, ...requestItems];
        },
        enabled: !!centerId && !!date,
        staleTime: 2 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
    });
}

/**
 * Transform bookings to assignable work items
 */
export function transformBookingToWorkItem(booking: Booking): AssignableWorkItem {
    const services = [booking.serviceType, booking.repairParts]
        .filter(Boolean)
        .join(" • ");

    return {
        id: booking.id,
        type: "booking",
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerEmail: booking.customerEmail,
        vehicleInfo: `${booking.vehicleBrand} (${booking.vehicleType ?? 'N/A'})`,
        services,
        scheduledTime: booking.preferredDate ?? booking.createdAt,
        status: mapBookingStatus(booking.status as BookingStatus),
        suggestedTechId: undefined, // BookingResponseDto doesn't have technicianId
    };
}

function mapBookingStatus(status: BookingStatus): string {
    switch (status) {
        case BookingStatus.PENDING:
            return "Pending";
        case BookingStatus.ASSIGNED:
            return "Assigned";
        case BookingStatus.IN_QUEUE:
            return "In Queue";
        case BookingStatus.ACTIVE:
            return "Active";
        case BookingStatus.CONFIRMED:
            return "Assigned";
        case BookingStatus.IN_PROGRESS:
            return "Active";
        case BookingStatus.COMPLETED:
            return "Completed";
        case BookingStatus.CANCELLED:
            return "Cancelled";
        case BookingStatus.REASSIGNED:
            return "Reassigned";
        default:
            return status;
    }
}

/**
 * Hook to get assignable bookings transformed to work items
 */
export function useAssignableBookingsAsWork(
    centerId: string | null,
    date: string
): UseQueryResult<AssignableWorkItem[], Error> {
    return useQuery({
        queryKey: ["assignable-bookings-work", centerId, date],
        queryFn: async () => {
            // Import bookingService dynamically to avoid circular deps
            const { bookingService } = await import("@/services/bookingService");

            const bookings = await bookingService.getClientBookings({});

            return bookings
                .filter((booking: any) => {
                    const bookingDate = new Date(booking.preferredDate ?? booking.createdAt)
                        .toISOString()
                        .split("T")[0];
                    const matchesDate = bookingDate === date;
                    const matchesCenter = !centerId || booking.serviceCenterId === centerId;
                    const isAssignable =
                        booking.status === "Approved" ||
                        booking.status === BookingStatus.CONFIRMED;

                    return matchesDate && matchesCenter && isAssignable;
                })
                .map(transformBookingToWorkItem);
        },
        enabled: !!centerId && !!date,
        staleTime: 2 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
    });
}
