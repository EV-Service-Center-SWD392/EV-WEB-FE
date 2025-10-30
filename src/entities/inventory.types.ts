// Types matching backend API DTOs
export interface InventoryDto {
  inventoryId: string;
  centerId: string;
  quantity?: number;
  minimumStockLevel?: number;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInventoryDto {
  centerId: string;
  quantity?: number;
  minimumStockLevel?: number;
}

export interface UpdateInventoryDto {
  quantity?: number;
  minimumStockLevel?: number;
  status?: string;
}

export interface InventoryFilters {
  centerId?: string;
  partName?: string;
  serviceCenter?: string;
  vehicleBrand?: string;
  vehicleType?: string;
  lowStock?: boolean;
  status?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: "asc" | "desc";
}

// Extended types for UI
export interface InventoryWithDetails extends InventoryDto {
  centerName?: string;
  spareparts?: Array<{
    id: string;
    name: string;
    unitPrice?: number;
    manufacture?: string;
  }>;
  totalValue?: number;
  lowStockAlert?: boolean;
}

export interface InventoryStats {
  totalInventories: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeCenters: number;
}

// Legacy types for backward compatibility
export interface InventoryItem {
  id: string;
  partName: string;
  serviceCenter: string;
  quantity: number;
  vehicleBrand: string;
  vehicleType: string;
  unitPrice: number;
  addedDate: string;
  lastUpdated: string;
  minStock: number;
  isActive: boolean;
}

export interface CreateInventoryRequest {
  partName: string;
  serviceCenter: string;
  quantity: number;
  vehicleBrand: string;
  vehicleType: string;
  unitPrice: number;
  minStock: number;
}

export interface UpdateInventoryRequest {
  partName?: string;
  serviceCenter?: string;
  quantity?: number;
  vehicleBrand?: string;
  vehicleType?: string;
  unitPrice?: number;
  minStock?: number;
  isActive?: boolean;
}
