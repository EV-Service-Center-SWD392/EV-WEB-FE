export interface InventoryItem {
  id: string;
  partName: string; // tên bộ phận
  serviceCenter: string; // trung tâm xe
  quantity: number; // số lượng
  vehicleBrand: string; // hãng xe
  vehicleType: string; // loại xe
  unitPrice: number; // giá đơn vị
  addedDate: string; // ngày thêm
  lastUpdated: string;
  minStock: number; // số lượng tối thiểu
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

export interface InventoryFilters {
  partName?: string;
  serviceCenter?: string;
  vehicleBrand?: string;
  vehicleType?: string;
  lowStock?: boolean; // lọc những item có stock thấp
  isActive?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: "asc" | "desc";
}
