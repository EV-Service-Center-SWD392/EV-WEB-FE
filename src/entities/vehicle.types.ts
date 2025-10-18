export interface Vehicle {
  id: string;
  customerId: string;
  modelId: string; // Sẽ cần thêm type cho VehicleModel sau
  licensePlate: string;
  year: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}
