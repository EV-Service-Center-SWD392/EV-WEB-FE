import { Order, OrderStatus, UpdateOrderPayload } from "@/entities/order.types";

// --- MOCK DATA ---
const MOCK_ORDER_PROPOSING: Order = {
  orderId: "order_1",
  bookingId: "booking_1",
  customerId: "user_123",
  vehicleId: "vehicle_abc",
  status: "PROPOSING", // Status chờ member duyệt
  totalAmount: 2550000,
  paycheckId: undefined,
  createdAt: "2025-10-16T14:00:00Z",
  updatedAt: "2025-10-16T14:00:00Z",
  items: [
    {
      orderServiceId: "item_1",
      orderId: "order_1",
      serviceId: "sv_01",
      quantity: 1,
      unitPrice: 50000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, // Khám tổng quát
    {
      orderServiceId: "item_2",
      orderId: "order_1",
      sparePartId: "sp_12",
      quantity: 1,
      unitPrice: 2500000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, // Thay pin
  ],
};
// --- END MOCK DATA ---

class OrderService {
  private delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Lấy chi tiết order (proposal) để member xem
  async getOrderDetails(orderId: string): Promise<Order | undefined> {
    await this.delay();
    // Khi có BE: return api.get(`/orders/${orderId}`);
    console.log(`SERVICE: Fetching order details for ${orderId}...`);
    if (orderId === MOCK_ORDER_PROPOSING.orderId) {
      return MOCK_ORDER_PROPOSING;
    }
    return undefined;
  }

  // Member xác nhận proposal
  async approveOrder(orderId: string): Promise<Order> {
    await this.delay(1000);
    // Khi có BE: return api.put(`/orders/${orderId}/confirm`);
    console.log(`SERVICE: Approving order ${orderId}...`);

    if (orderId === MOCK_ORDER_PROPOSING.orderId) {
      MOCK_ORDER_PROPOSING.status = "IN_PROGRESS";
      MOCK_ORDER_PROPOSING.updatedAt = new Date().toISOString();
      return { ...MOCK_ORDER_PROPOSING };
    }
    throw new Error("Order not found");
  }

  // Member yêu cầu thay đổi proposal
  async requestOrderChanges(payload: UpdateOrderPayload): Promise<Order> {
    await this.delay(1000);
    // Khi có BE: return api.put(`/orders/${payload.orderId}/request-changes`, payload);
    console.log("SERVICE: Requesting changes for order:", payload);

    if (payload.orderId === MOCK_ORDER_PROPOSING.orderId) {
      // Logic mock để giả lập việc update item list
      // Ở BE thật sự sẽ phức tạp hơn
      console.log("Simulating item updates...");
      MOCK_ORDER_PROPOSING.updatedAt = new Date().toISOString();

      // QUAN TRỌNG: Status vẫn là PROPOSING theo yêu cầu của bạn
      MOCK_ORDER_PROPOSING.status = "PROPOSING";

      return { ...MOCK_ORDER_PROPOSING };
    }
    throw new Error("Order not found");
  }
}

export const orderService = new OrderService();
