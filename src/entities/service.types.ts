export interface Service {
  serviceId: string;
  name: string;
  description: string;
  duration: number;
  basePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface SparePart {
  id: string;
  vehicleModel: string; // or modelId?
  inventoryId: string;
  typeId: string;
  name: string;
  unitPrice: number;
  manufacturer: string;
  status: string; // e.g., 'Available', 'OutOfStock'
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  durationMinutes?: number;
  category?: string;
  isActive?: boolean;
}

export interface ServiceCatalogOption {
  id: string;
  name: string;
  group?: string;
  description?: string;
  durationMinutes?: number;
}
