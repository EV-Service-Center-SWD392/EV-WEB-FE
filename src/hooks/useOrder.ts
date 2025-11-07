import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/services/orderService";

import { UpdateOrderPayload } from "@/entities/order.types";

// Hook để lấy chi tiết 1 order (proposal)
export const useOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderDetails(orderId),
    enabled: !!orderId,
  });
};

// Hook để member approve một proposal
export const useApproveOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => orderService.approveOrder(orderId),
    onSuccess: (updatedOrder) => {
      // Khi approve thành công, cập nhật data trong cache ngay lập tức
      console.log("HOOK: Order approved! Updating cache...");
      queryClient.setQueryData(["order", updatedOrder.orderId], updatedOrder);
    },
    onError: (error) => {
      console.error("HOOK: Failed to approve order:", error);
    },
  });
};

// Hook để member yêu cầu thay đổi proposal
export const useRequestOrderChanges = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOrderPayload) =>
      orderService.requestOrderChanges(payload),
    onSuccess: (updatedOrder) => {
      // Khi gửi request change thành công, cũng cập nhật cache để UI thay đổi
      console.log("HOOK: Change request sent! Updating cache...");
      queryClient.setQueryData(["order", updatedOrder.orderId], updatedOrder);
    },
    onError: (error) => {
      console.error("HOOK: Failed to request changes:", error);
    },
  });
};
