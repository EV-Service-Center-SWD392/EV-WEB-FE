/**
 * Booking Data Mapping Utilities
 * Handles mapping between Supabase format and API format
 */

// Supabase booking structure (lowercase fields)
export interface SupabaseBooking {
    bookingid: string;
    customerid?: string;
    vehicleid?: string;
    status: string;
    bookingdate?: string | null;
    notes?: string | null;
    useraccount?: {
        email?: string;
        phonenumber?: string;
        firstname?: string;
        lastname?: string;
    };
    vehicle?: {
        licenseplate?: string;
        year?: number;
        vehiclemodel?: {
            name?: string;
            brand?: string;
        };
    };
}

// API-compatible booking structure (camelCase fields)
export interface ApiBookingData {
    bookingId: string;
    customerId?: string;
    vehicleId?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    licensePlate?: string;
    status: string;
}

/**
 * Map Supabase booking to API format
 */
export function mapSupabaseBookingToApi(supabaseBooking: SupabaseBooking): ApiBookingData {
    const firstname = supabaseBooking.useraccount?.firstname || '';
    const lastname = supabaseBooking.useraccount?.lastname || '';
    const customerName = [firstname, lastname].filter(Boolean).join(' ') || undefined;

    return {
        bookingId: supabaseBooking.bookingid, // Map lowercase to camelCase
        customerId: supabaseBooking.customerid,
        vehicleId: supabaseBooking.vehicleid,
        customerName,
        customerPhone: supabaseBooking.useraccount?.phonenumber,
        customerEmail: supabaseBooking.useraccount?.email,
        vehicleBrand: supabaseBooking.vehicle?.vehiclemodel?.brand,
        vehicleModel: supabaseBooking.vehicle?.vehiclemodel?.name,
        licensePlate: supabaseBooking.vehicle?.licenseplate,
        status: supabaseBooking.status,
    };
}

/**
 * Extract booking ID from Supabase booking (handles both formats)
 */
export function getBookingId(booking: SupabaseBooking | ApiBookingData): string {
    return 'bookingid' in booking ? booking.bookingid : booking.bookingId;
}
