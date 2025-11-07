/**
 * Example: Cách sử dụng Direct Database Service
 * 
 * File này demo các cách query bookings trực tiếp từ database
 * không cần qua API của partner
 */

import { directBookingService } from '@/services/directBookingService';

// ✅ EXAMPLE 1: Lấy tất cả bookings
export async function getAllBookingsExample() {
    const bookings = await directBookingService.getAllBookings();
    console.log('All bookings:', bookings);
    return bookings;
}

// ✅ EXAMPLE 2: Lấy bookings với filters
export async function getFilteredBookingsExample() {
    const bookings = await directBookingService.getAllBookings({
        status: 'Pending',
        centerId: 'your-center-id',
        fromDate: '2024-01-01',
        toDate: '2024-12-31'
    });
    console.log('Filtered bookings:', bookings);
    return bookings;
}

// ✅ EXAMPLE 3: Lấy 1 booking theo ID
export async function getBookingByIdExample(bookingId: string) {
    const booking = await directBookingService.getBookingById(bookingId);
    console.log('Booking detail:', booking);
    return booking;
}

// ✅ EXAMPLE 4: Lấy chỉ pending bookings
export async function getPendingBookingsExample() {
    const bookings = await directBookingService.getPendingBookings();
    console.log('Pending bookings:', bookings);
    return bookings;
}

// ✅ EXAMPLE 5: Update booking status
export async function approveBookingExample(bookingId: string) {
    await directBookingService.updateBookingStatus(
        bookingId,
        'Approved',
        'Approved by staff'
    );
    console.log('Booking approved!');
}

// ✅ EXAMPLE 6: Reject booking
export async function rejectBookingExample(bookingId: string) {
    await directBookingService.updateBookingStatus(
        bookingId,
        'Rejected',
        'Vehicle not supported'
    );
    console.log('Booking rejected!');
}

// ✅ EXAMPLE 7: Sử dụng trong React Component
export function BookingListComponent() {
    // Trong component của bạn
    const loadBookings = async () => {
        try {
            // Query trực tiếp từ database
            const data = await directBookingService.getAllBookings({
                status: 'Pending'
            });

            // Set vào state
            // setBookings(data);

            console.log('Loaded bookings:', data);
        } catch (error) {
            console.error('Error loading bookings:', error);
        }
    };

    return null; // Your JSX here
}

// ✅ EXAMPLE 8: So sánh với Partner API
export async function compareDataSources() {
    try {
        // Cách 1: Direct DB
        const directData = await directBookingService.getAllBookings();

        // Cách 2: Partner API
        // const apiData = await bookingService.getClientBookings();

        console.log('Direct DB count:', directData.length);
        // console.log('Partner API count:', apiData.length);

        return directData;
    } catch (error) {
        console.error('Error comparing:', error);
        throw error;
    }
}

/**
 * 🎯 TIPS:
 * 
 * 1. Luôn wrap trong try-catch để handle errors
 * 2. Check xem data có phải array không trước khi .map()
 * 3. Có thể combine filters để query chính xác hơn
 * 4. Database query nhanh hơn API rất nhiều
 * 5. Không cần token authentication cho Supabase (dùng anon key)
 */
