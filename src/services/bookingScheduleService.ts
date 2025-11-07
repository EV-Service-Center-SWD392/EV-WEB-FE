
import { supabase } from '@/lib/supabase';

/**
 * BookingSchedule Service
 * Lấy thông tin slot từ bảng bookingschedule (slot thời gian cho booking)
 */

export interface BookingScheduleSlot {
    slotId: string;
    centerId: string;
    startUtc: string; // HH:MM format (e.g., "09:00")
    endUtc: string; // HH:MM format (e.g., "11:00")
    capacity: number;
    note?: string;
    status: 'OPEN' | 'CLOSED' | 'FULL'; // slot availability status
    isActive: boolean;
    dayOfWeek: string; // MON, TUE, WED, THU, FRI, SAT, SUN
    slot: number; // Slot number in the day
    createdAt: string;
    updatedAt: string;
}

export interface EnrichedBookingSlot extends BookingScheduleSlot {
    centerName?: string;
    availableCapacity?: number; // capacity - current bookings
}

export const bookingScheduleService = {
    /**
     * Get slot by ID
     */
    async getSlotById(slotId: string): Promise<BookingScheduleSlot | null> {
        try {
            const { data, error } = await supabase
                .from('bookingschedule')
                .select('*')
                .eq('slotid', slotId)
                .eq('isactive', true)
                .single();

            if (error || !data) {
                console.error('[BookingScheduleService] Error fetching slot:', error);
                return null;
            }

            return this.mapToSlot(data);
        } catch (error) {
            console.error('[BookingScheduleService] Failed to fetch slot:', error);
            return null;
        }
    },

    /**
     * Get slots by center ID
     */
    async getSlotsByCenter(centerId: string): Promise<BookingScheduleSlot[]> {
        try {
            const { data, error } = await supabase
                .from('bookingschedule')
                .select('*')
                .eq('centerid', centerId)
                .eq('isactive', true)
                .order('dayofweek', { ascending: true })
                .order('slot', { ascending: true });

            if (error || !data) {
                console.error('[BookingScheduleService] Error fetching slots:', error);
                return [];
            }

            return data.map(row => this.mapToSlot(row));
        } catch (error) {
            console.error('[BookingScheduleService] Failed to fetch slots:', error);
            return [];
        }
    },

    /**
     * Get slots by day of week
     */
    async getSlotsByDayOfWeek(dayOfWeek: string): Promise<BookingScheduleSlot[]> {
        try {
            const { data, error } = await supabase
                .from('bookingschedule')
                .select('*')
                .eq('dayofweek', dayOfWeek.toUpperCase())
                .eq('isactive', true)
                .eq('status', 'OPEN')
                .order('slot', { ascending: true });

            if (error || !data) {
                console.error('[BookingScheduleService] Error fetching slots:', error);
                return [];
            }

            return data.map(row => this.mapToSlot(row));
        } catch (error) {
            console.error('[BookingScheduleService] Failed to fetch slots:', error);
            return [];
        }
    },

    /**
     * Get available slots (OPEN status with capacity)
     */
    async getAvailableSlots(centerId?: string): Promise<BookingScheduleSlot[]> {
        try {
            let query = supabase
                .from('bookingschedule')
                .select('*')
                .eq('isactive', true)
                .eq('status', 'OPEN')
                .gt('capacity', 0);

            if (centerId) {
                query = query.eq('centerid', centerId);
            }

            const { data, error } = await query.order('dayofweek', { ascending: true })
                .order('slot', { ascending: true });

            if (error || !data) {
                console.error('[BookingScheduleService] Error fetching available slots:', error);
                return [];
            }

            return data.map(row => this.mapToSlot(row));
        } catch (error) {
            console.error('[BookingScheduleService] Failed to fetch available slots:', error);
            return [];
        }
    },

    /**
     * Get slot with center info
     */
    async getEnrichedSlotById(slotId: string): Promise<EnrichedBookingSlot | null> {
        try {
            // First get the slot
            const slot = await this.getSlotById(slotId);
            if (!slot) {
                return null;
            }

            // Then get center info separately
            const { data: centerData, error: centerError } = await supabase
                .from('centertuantm')
                .select('name')
                .eq('centerid', slot.centerId)
                .single();

            if (centerError) {
                console.warn('[BookingScheduleService] Could not fetch center name:', centerError);
                // Return slot without center name rather than failing
                return slot;
            }

            return {
                ...slot,
                centerName: centerData?.name || undefined,
            };
        } catch (error) {
            console.error('[BookingScheduleService] Failed to fetch enriched slot:', error);
            return null;
        }
    },

    /**
     * Map database row to BookingScheduleSlot
     */
    mapToSlot(row: Record<string, unknown>): BookingScheduleSlot {
        return {
            slotId: String(row.slotid),
            centerId: String(row.centerid),
            startUtc: String(row.startutc),
            endUtc: String(row.endutc),
            capacity: Number(row.capacity) || 1,
            note: row.note ? String(row.note) : undefined,
            status: (row.status ? String(row.status).toUpperCase() : 'OPEN') as 'OPEN' | 'CLOSED' | 'FULL',
            isActive: Boolean(row.isactive ?? true),
            dayOfWeek: String(row.dayofweek),
            slot: Number(row.slot),
            createdAt: String(row.createdat),
            updatedAt: String(row.updatedat),
        };
    },

    /**
     * Format time display (HH:MM)
     */
    formatSlotTime(slot: BookingScheduleSlot): string {
        return `${slot.startUtc} - ${slot.endUtc}`;
    },

    /**
     * Get day of week label (Vietnamese)
     */
    getDayOfWeekLabel(dayOfWeek: string): string {
        const labels: Record<string, string> = {
            'MON': 'Thứ 2',
            'TUE': 'Thứ 3',
            'WED': 'Thứ 4',
            'THU': 'Thứ 5',
            'FRI': 'Thứ 6',
            'SAT': 'Thứ 7',
            'SUN': 'Chủ nhật',
        };
        return labels[dayOfWeek.toUpperCase()] || dayOfWeek;
    },

    /**
     * Get status badge color
     */
    getStatusBadgeColor(status: string): string {
        switch (status.toUpperCase()) {
            case 'OPEN':
                return 'bg-green-500';
            case 'FULL':
                return 'bg-orange-500';
            case 'CLOSED':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    },
};

export default bookingScheduleService;
