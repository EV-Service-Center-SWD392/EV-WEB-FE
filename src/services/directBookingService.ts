import { supabase } from '@/lib/supabase';
import type { BookingResponseDto } from '@/entities/booking.types';

/**
 * Raw database row type from bookinghuykt table
 */
interface BookingRow {
    bookingid: string;
    customerid: string;
    vehicleid: string;
    slotid: string | null;
    notes: string | null;
    status: string;
    isactive: boolean;
    createdat: string;
    updatedat: string;
    bookingdate: string | null;
}

/**
 * Direct Database Booking Service
 * Query trực tiếp từ database: bookinghuykt
 * 
 * ⚠️ Schema mapping:
 * 
 * useraccount table:
 * - userid, email, phonenumber, firstname, lastname
 * 
 * vehicle table:
 * - vehicleid, licenseplate, year, color, modelid
 * - JOIN với vehiclemodel để lấy brand/model name
 */
export const directBookingService = {
    /**
     * Lấy tất cả bookings từ database
     * @param filters - Các filter tùy chọn
     */
    async getAllBookings(filters?: {
        status?: string;
        centerId?: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<BookingResponseDto[]> {
        try {
            // Query với JOIN để lấy customer và vehicle info
            let query = supabase
                .from('bookinghuykt')
                .select(`
                    *,
                    useraccount!bookinghuykt_customerid_fkey (
                        email,
                        phonenumber,
                        firstname,
                        lastname
                    ),
                    vehicle!bookinghuykt_vehicleid_fkey (
                        licenseplate,
                        year,
                        color,
                        vehiclemodel (
                            name,
                            brand
                        )
                    )
                `)
                .eq('isactive', true)
                .order('createdat', { ascending: false });

            // Apply filters
            if (filters?.status) {
                query = query.eq('status', filters.status.toUpperCase());
            }
            if (filters?.fromDate) {
                query = query.gte('bookingdate', filters.fromDate);
            }
            if (filters?.toDate) {
                query = query.lte('bookingdate', filters.toDate);
            }

            const { data, error } = await query;

            if (error) {
                console.error('[DirectBookingService] Error:', error);
                throw error;
            }

            // Map database columns to DTO format
            const mappedData = data?.map((row: BookingRow & {
                useraccount?: {
                    email?: string;
                    phonenumber?: string;
                    firstname?: string;
                    lastname?: string;
                };
                vehicle?: {
                    licenseplate?: string;
                    year?: number;
                    color?: string;
                    vehiclemodel?: {
                        name?: string;
                        brand?: string;
                    };
                }
            }) => {
                const customerName = [row.useraccount?.firstname, row.useraccount?.lastname]
                    .filter(Boolean)
                    .join(' ') || 'Unknown Customer';

                const vehicleBrand = row.vehicle?.vehiclemodel?.brand || 'Unknown';
                const vehicleModel = row.vehicle?.vehiclemodel?.name || row.vehicle?.licenseplate || 'Unknown';

                // Normalize status: PENDING → Pending, APPROVED → Approved, REJECTED → Rejected
                const normalizeStatus = (dbStatus: string): "Pending" | "Approved" | "Rejected" => {
                    const status = dbStatus.toUpperCase();
                    if (status === 'APPROVED') return 'Approved';
                    if (status === 'REJECTED') return 'Rejected';
                    return 'Pending';
                };

                return {
                    id: row.bookingid,
                    customerId: row.customerid,
                    customerName: customerName,
                    customerEmail: row.useraccount?.email || '',
                    customerPhone: row.useraccount?.phonenumber || '',

                    vehicleId: row.vehicleid,
                    vehicleBrand: vehicleBrand,
                    vehicleModel: vehicleModel,
                    vehicleVin: row.vehicle?.licenseplate || '',

                    slotId: row.slotid,
                    notes: row.notes || '',
                    status: normalizeStatus(row.status),

                    createdAt: row.createdat,
                    updatedAt: row.updatedat,
                    bookingDate: row.bookingdate || '',
                };
            }) || [];

            return mappedData as BookingResponseDto[];
        } catch (error) {
            console.error('[DirectBookingService] Failed to fetch bookings:', error);
            throw error;
        }
    },

    /**
     * Lấy booking theo ID
     */
    async getBookingById(bookingId: string): Promise<BookingResponseDto | null> {
        try {
            const { data, error } = await supabase
                .from('bookinghuykt')
                .select(`
                    *,
                    useraccount!bookinghuykt_customerid_fkey (
                        email,
                        phonenumber,
                        firstname,
                        lastname
                    ),
                    vehicle!bookinghuykt_vehicleid_fkey (
                        licenseplate,
                        year,
                        color,
                        vehiclemodel (
                            name,
                            brand
                        )
                    )
                `)
                .eq('bookingid', bookingId)
                .eq('isactive', true)
                .single();

            if (error) {
                console.error('[DirectBookingService] Error:', error);
                throw error;
            }

            if (!data) return null;

            const customerName = [data.useraccount?.firstname, data.useraccount?.lastname]
                .filter(Boolean)
                .join(' ') || 'Unknown Customer';

            const vehicleBrand = data.vehicle?.vehiclemodel?.brand || 'Unknown';
            const vehicleModel = data.vehicle?.vehiclemodel?.name || data.vehicle?.licenseplate || 'Unknown';

            // Normalize status
            const normalizeStatus = (dbStatus: string): "Pending" | "Approved" | "Rejected" => {
                const status = dbStatus.toUpperCase();
                if (status === 'APPROVED') return 'Approved';
                if (status === 'REJECTED') return 'Rejected';
                return 'Pending';
            };

            // Map to DTO
            return {
                id: data.bookingid,
                customerId: data.customerid,
                customerName: customerName,
                customerEmail: data.useraccount?.email || '',
                customerPhone: data.useraccount?.phonenumber || '',

                vehicleId: data.vehicleid,
                vehicleBrand: vehicleBrand,
                vehicleModel: vehicleModel,
                vehicleVin: data.vehicle?.licenseplate || '',

                slotId: data.slotid,
                notes: data.notes || '',
                status: normalizeStatus(data.status),

                createdAt: data.createdat,
                updatedAt: data.updatedat,
                bookingDate: data.bookingdate || '',
            } as BookingResponseDto;
        } catch (error) {
            console.error('[DirectBookingService] Failed to fetch booking:', error);
            throw error;
        }
    },

    /**
     * Update booking status (optional - nếu cần)
     */
    async updateBookingStatus(
        bookingId: string,
        status: 'Pending' | 'Approved' | 'Rejected',
        rejectReason?: string
    ): Promise<void> {
        try {
            const updateData: Record<string, unknown> = {
                status,
                updatedAt: new Date().toISOString(),
            };

            if (rejectReason) {
                updateData.rejectReason = rejectReason;
            }

            const { error } = await supabase
                .from('bookinghuykt') // ✅ Tên bảng chính xác
                .update(updateData)
                .eq('bookingid', bookingId); // Column: bookingid

            if (error) {
                console.error('[DirectBookingService] Update error:', error);
                throw error;
            }
        } catch (error) {
            console.error('[DirectBookingService] Failed to update booking:', error);
            throw error;
        }
    },

    /**
     * Lấy bookings theo status (Pending, Approved, Rejected)
     */
    async getBookingsByStatus(status: string): Promise<BookingResponseDto[]> {
        return this.getAllBookings({ status });
    },

    /**
     * Lấy pending bookings (cho staff assignment)
     */
    async getPendingBookings(): Promise<BookingResponseDto[]> {
        return this.getBookingsByStatus('Pending');
    },
};

export default directBookingService;
