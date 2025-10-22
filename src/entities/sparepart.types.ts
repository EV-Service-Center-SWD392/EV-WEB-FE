// Types matching backend API DTOs
export interface SparepartDto {
  sparepartId: string;
  vehicleModelId?: number;
  inventoryId?: string;
  typeId?: string;
  name: string;
  unitPrice?: number;
  manufacture?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSparepartDto {
  vehicleModelId?: number;
  inventoryId: string;
  typeId: string;
  name: string;
  unitPrice?: number;
  manufacture?: string;
}

export interface UpdateSparepartDto {
  vehicleModelId?: number;
  inventoryId: string;
  typeId: string;
  name: string;
  unitPrice?: number;
  manufacture?: string;
  status?: string;
}

export interface SparepartTypeDto {
  typeId: string;
  name: string;
  description?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSparepartTypeDto {
  name: string;
  description?: string;
}

export interface UpdateSparepartTypeDto {
  name: string;
  description?: string;
  status?: string;
}

export interface SparepartForecastDto {
  forecastId: string;
  sparepartId: string;
  centerId: string;
  predictedUsage?: number;
  safetyStock?: number;
  reorderPoint?: number;
  forecastedBy?: string;
  forecastConfidence?: number;
  forecastDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSparepartForecastDto {
  sparepartId: string;
  centerId: string;
  predictedUsage?: number;
  safetyStock?: number;
  reorderPoint?: number;
  forecastedBy?: string;
  forecastConfidence?: number;
}

export interface UpdateSparepartForecastDto {
  sparepartId: string;
  centerId: string;
  predictedUsage?: number;
  safetyStock?: number;
  reorderPoint?: number;
  forecastedBy?: string;
  forecastConfidence?: number;
  status?: string;
}

export interface SparepartReplenishmentRequestDto {
  id: string;
  centerId: string;
  sparepartId: string;
  forecastId?: string;
  suggestedQuantity?: number;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSparepartReplenishmentRequestDto {
  centerId: string;
  sparepartId: string;
  forecastId?: string;
  suggestedQuantity?: number;
  notes?: string;
}

export interface UpdateSparepartReplenishmentRequestDto {
  centerId: string;
  sparepartId: string;
  forecastId?: string;
  suggestedQuantity?: number;
  notes?: string;
  status?: string;
}

export interface SparepartUsageHistoryDto {
  usageId: string;
  sparepartId: string;
  centerId: string;
  orderSparepartId?: string;
  quantityUsed: number;
  usedDate?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Extended types for UI
export interface SparepartWithDetails extends SparepartDto {
  typeName?: string;
  vehicleModelName?: string;
  currentStock?: number;
  minimumStock?: number;
  lowStock?: boolean;
  outOfStock?: boolean;
  forecast?: SparepartForecastDto;
  usageHistory?: SparepartUsageHistoryDto[];
}

export interface SparepartFilters {
  name?: string;
  typeId?: string;
  vehicleModelId?: number;
  manufacture?: string;
  status?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: "asc" | "desc";
}

export interface SparepartStats {
  totalSpareparts: number;
  totalTypes: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  pendingForecasts: number;
  pendingReplenishments: number;
}