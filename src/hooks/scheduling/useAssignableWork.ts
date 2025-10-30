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
            const items: AssignableWorkItem[] = [];

            // TODO: Fetch service requests when the endpoint is available
            // const requests = await serviceRequestService.getRequests({ 
            //   centerId, 
            //   date,
            //   status: 'validated' 
            // });

            // For now, we'll use a mock or empty array
            // When service request feature is implemented, uncomment and adapt:
            // requests.forEach(req => {
            //   items.push({
            //     id: req.id,
            //     type: 'request',
            //     customerName: req.customerName,
            //     customerPhone: req.customerPhone,
            //     vehicleInfo: `${req.vehicleBrand} ${req.vehicleModel}`,
            //     services: req.services.join(', '),
            //     timeWindow: req.preferredTimeWindow,
            //     status: req.status,
            //     priority: req.priority,
            //   });
            // });

            return items;
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
    return {
        id: booking.id,
        type: "booking",
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerEmail: booking.customerEmail,
        vehicleInfo: `${booking.vehicleBrand} (${booking.vehicleType})`,
        services: booking.repairParts,
        scheduledTime: booking.scheduledDate,
        status: booking.status,
        suggestedTechId: booking.technicianId,
    };
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

            const bookings = await bookingService.getBookings({});

            return bookings
                .filter((booking) => {
                    const bookingDate = new Date(booking.scheduledDate)
                        .toISOString()
                        .split("T")[0];
                    const matchesDate = bookingDate === date;
                    const matchesCenter = !centerId || booking.serviceCenter === centerId;
                    const isAssignable = booking.status === BookingStatus.CONFIRMED;

                    return matchesDate && matchesCenter && isAssignable;
                })
                .map(transformBookingToWorkItem);
        },
        enabled: !!centerId && !!date,
        staleTime: 2 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
    });
}
