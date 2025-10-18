import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bookingService,
  CreateBookingPayload,
} from "@/services/bookingService";

// Hook để lấy danh sách booking của member
export const useMyBookings = () => {
  return useQuery({
    queryKey: ["myBookings"],
    queryFn: () => bookingService.getMyBookings(),
  });
};

// Hook để lấy chi tiết 1 booking
export const useBookingDetails = (bookingId: string) => {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingService.getBookingById(bookingId),
    enabled: !!bookingId, // Chỉ chạy query khi có bookingId
  });
};

// Hook để tạo booking mới
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      bookingService.createBooking(payload),
    onSuccess: () => {
      // Khi tạo booking thành công, làm mới lại list booking
      console.log("HOOK: Booking created! Invalidating bookings list...");
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
    },
    onError: (error) => {
      console.error("HOOK: Failed to create booking:", error);
      // Thêm logic hiển thị toast/notification báo lỗi ở đây
    },
  });
};
