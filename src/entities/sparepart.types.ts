// Types matching backend API DTOs
export interface SparepartDto {
  sparepartId: string;
  vehicleModelId?: number;
  inventoryId?: string;
  typeId?: string;
  name: string;
  description?: string | null;
  manufacturer?: string;
  partNumber?: string | null;
  unitPrice?: number;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  inventoryName?: string | null;
  typeName?: string | null;
}

export interface CreateSparepartDto {
  vehicleModelId?: number;
  centerName: string;
  typeName: string;
  name: string;
  description?: string;
  manufacturer?: string;
  partNumber?: string;
  unitPrice?: number;
}

export interface UpdateSparepartDto {
  vehicleModelId?: number;
  inventoryId?: string;
  typeId?: string;
  name?: string;
  description?: string;
  manufacturer?: string;
  partNumber?: string;
  unitPrice?: number;
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
  sparepartId: string;
  centerId: string;
  forecastId?: string;
  requestedQuantity?: number;
  suggestedQuantity?: number;
  requestedBy?: string;
  approvedBy?: string;
  supplierId?: string;
  estimatedCost?: number;
  priority?: string;
  status?: string;
  notes?: string;
  approvalDate?: string;
  approvedAt?: string;
  expectedDeliveryDate?: string;
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
  sparepartId: string;
  centerId: string;
  requestedQuantity: number;
  requestedBy: string;
  approvedBy?: string;
  supplierId?: string;
  estimatedCost?: number;
  priority: string;
  status: string;
  notes?: string;
  approvalDate?: string;
  expectedDeliveryDate?: string;
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
  manufacturer?: string;
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