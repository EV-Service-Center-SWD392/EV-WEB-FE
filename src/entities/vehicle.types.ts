export interface Vehicle {
  vehicleId: string;
  customerId: string;
  modelId: string; // keep reference to model id
  licensePlate: string;
  year?: number;
  color?: string;
  status?: string;
  isActive?: boolean;
  createAt: string;
  updateAt: string;
}
