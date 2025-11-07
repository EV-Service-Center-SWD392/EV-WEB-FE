/**
 * Script để list tất cả tables trong Supabase database
 * Chạy script này để tìm tên bảng chính xác
 */

import { supabase } from '@/lib/supabase';

export async function listAllTables() {
    console.warn('🔍 Đang tìm tất cả tables trong database...');

    // Thử các cách khác nhau để list tables

    // Cách 1: Dùng RPC (nếu có function)
    try {
        const { data, error } = await supabase.rpc('get_tables');
        if (!error && data) {
            console.warn('✅ Tables found (via RPC):', data);
            return data;
        }
    } catch (e) {
        // Ignore
    }

    // Cách 2: Thử query từng table name có thể
    const possibleTableNames = [
        'bookings',
        'Bookings',
        'Booking',
        'booking',
        'tbl_bookings',
        'tbl_Bookings',
        'BookingHuyKt',
        'bookinghuykt',
        'Booking_Table',
        'booking_table'
    ];

    console.warn('🧪 Thử từng tên bảng có thể...');

    for (const tableName of possibleTableNames) {
        try {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);

            if (!error) {
                console.warn(`✅ Tìm thấy table: "${tableName}"`);
                console.warn('Sample data:', data);
                return tableName;
            }
        } catch (e) {
            // Continue
        }
    }

    console.error('❌ Không tìm thấy table nào!');
    console.error('📋 Hướng dẫn:');
    console.error('1. Vào Supabase Dashboard → Table Editor');
    console.error('2. Xem danh sách tables');
    console.error('3. Copy tên table chính xác');
    console.error('4. Update trong directBookingService.ts');

    return null;
}

// Export để dùng trong component
export default listAllTables;
