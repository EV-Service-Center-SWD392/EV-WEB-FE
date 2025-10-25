import type {
  InventoryDto,
  CreateInventoryDto,
  UpdateInventoryDto,
  InventoryWithDetails,
  InventoryFilters,
  InventoryStats,
} from "@/entities/inventory.types";

import { api } from "./api";

const INVENTORY_PATH = "/api/inventory";

/**
 * Inventory Service
 * Manages inventory operations
 */
export const inventoryService = {
  /**
   * Get all inventories with optional filters
   */
  async getAllInventories(filters?: InventoryFilters): Promise<InventoryDto[]> {
    const response = await api.get<InventoryDto[]>(INVENTORY_PATH, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get a single inventory by ID
   */
  async getInventoryById(id: string): Promise<InventoryDto> {
    const response = await api.get<InventoryDto>(`${INVENTORY_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create a new inventory
   */
  async createInventory(data: CreateInventoryDto): Promise<InventoryDto> {
    const response = await api.post<InventoryDto>(INVENTORY_PATH, data);
    return response.data;
  },

  /**
   * Update an existing inventory
   */
  async updateInventory(id: string, data: UpdateInventoryDto): Promise<InventoryDto> {
    const response = await api.put<InventoryDto>(`${INVENTORY_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete an inventory
   */
  async deleteInventory(id: string): Promise<void> {
    await api.delete(`${INVENTORY_PATH}/${id}`);
  },

  /**
   * Get inventories by center
   */
  async getInventoriesByCenter(centerId: string): Promise<InventoryDto[]> {
    const response = await api.get<InventoryDto[]>(`${INVENTORY_PATH}/center/${centerId}`);
    return response.data;
  },

  /**
   * Get low stock inventories
   */
  async getLowStockInventories(): Promise<InventoryDto[]> {
    const response = await api.get<InventoryDto[]>(`${INVENTORY_PATH}/low-stock`);
    return response.data;
  },

  /**
   * Update inventory quantity
   */
  async updateQuantity(id: string, quantity: number): Promise<InventoryDto> {
    const response = await api.put<InventoryDto>(`${INVENTORY_PATH}/${id}/quantity`, { quantity });
    return response.data;
  },

  /**
   * Get inventory statistics
   */
  async getInventoryStats(centerId?: string): Promise<InventoryStats> {
    const response = await api.get<InventoryStats>(`${INVENTORY_PATH}/stats`, {
      params: centerId ? { centerId } : undefined,
    });
    return response.data;
  },
};

export default inventoryService;
