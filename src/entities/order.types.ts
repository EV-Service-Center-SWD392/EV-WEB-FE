export type OrderStatus =
  | "PENDING" // Chờ tech khám và lên proposal
  | "PROPOSING" // Tech đã gửi proposal, chờ member duyệt
  | "IN_PROGRESS" // Member đã duyệt, đang sửa chữa
  | "COMPLETED" // Hoàn thành
  | "CANCELLED";

// Một dòng trong proposal/order, có thể là service hoặc spare part
export interface OrderItem {
  orderServiceId: string;
  orderId: string;
  serviceId?: string;
  sparePartId?: string;
  // Dựa vào serviceId hay sparePartId tồn tại để biết đây là dòng nào
  quantity: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

// Cái proposal chính là cái Order này
export interface Order {
  orderId: string;
  customerId: string;
  vehicleId: string;
  bookingId: string;
  status: OrderStatus;
  totalAmount: number;
  paycheckId?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface UpdateOrderPayload {
  orderId: string;
  updates?: { itemId: string; quantity: number }[];
  additions?: { serviceId?: string; sparePartId?: string; quantity: number }[];
  deletions?: string[]; // array of orderItemIds
  reason?: string;
}
