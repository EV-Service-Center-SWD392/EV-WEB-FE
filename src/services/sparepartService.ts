import type {
  SparepartDto,
  CreateSparepartDto,
  UpdateSparepartDto,
  SparepartWithDetails,
  SparepartFilters,
  SparepartStats,
  SparepartTypeDto,
  CreateSparepartTypeDto,
  UpdateSparepartTypeDto,
} from "@/entities/sparepart.types";

import { api } from "./api";

const SPAREPART_PATH = "/sparepart";
const SPAREPART_TYPE_PATH = "/spareparttype";

/**
 * Sparepart Service
 * Manages sparepart operations
 */
export const sparepartService = {
  /**
   * Get all spareparts with optional filters
   */
  async getAllSpareparts(filters?: SparepartFilters): Promise<SparepartDto[]> {
    const response = await api.get<SparepartDto[]>(SPAREPART_PATH, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get a single sparepart by ID
   */
  async getSparepartById(id: string): Promise<SparepartDto> {
    const response = await api.get<SparepartDto>(`${SPAREPART_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create a new sparepart
   */
  async createSparepart(data: CreateSparepartDto): Promise<SparepartDto> {
    const response = await api.post<SparepartDto>(SPAREPART_PATH, data);
    return response.data;
  },

  /**
   * Update an existing sparepart
   */
  async updateSparepart(id: string, data: UpdateSparepartDto): Promise<SparepartDto> {
    const response = await api.put<SparepartDto>(`${SPAREPART_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a sparepart
   */
  async deleteSparepart(id: string): Promise<void> {
    await api.delete(`${SPAREPART_PATH}/${id}`);
  },

  /**
   * Search spareparts by term
   */
  async searchSpareparts(searchTerm: string): Promise<SparepartDto[]> {
    const response = await api.get<SparepartDto[]>(`${SPAREPART_PATH}/search`, {
      params: { searchTerm },
    });
    return response.data;
  },

  /**
   * Get spareparts by type
   */
  async getSparepartsByType(typeId: string): Promise<SparepartDto[]> {
    const response = await api.get<SparepartDto[]>(`${SPAREPART_PATH}/type/${typeId}`);
    return response.data;
  },

  /**
   * Get spareparts by vehicle model
   */
  async getSparepartsByVehicleModel(vehicleModelId: string): Promise<SparepartDto[]> {
    const response = await api.get<SparepartDto[]>(`${SPAREPART_PATH}/vehicle-model/${vehicleModelId}`);
    return response.data;
  },

  /**
   * Get spareparts by manufacturer
   */
  async getSparepartsByManufacturer(manufacturer: string): Promise<SparepartDto[]> {
    const response = await api.get<SparepartDto[]>(SPAREPART_PATH, {
      params: { manufacturer },
    });
    return response.data;
  },

  /**
   * Get all sparepart types
   */
  async getAllSparepartTypes(): Promise<SparepartTypeDto[]> {
    const response = await api.get<SparepartTypeDto[]>(SPAREPART_TYPE_PATH);
    return response.data;
  },

  /**
   * Get a single sparepart type by ID
   */
  async getSparepartTypeById(id: string): Promise<SparepartTypeDto> {
    const response = await api.get<SparepartTypeDto>(`${SPAREPART_TYPE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create a new sparepart type
   */
  async createSparepartType(data: CreateSparepartTypeDto): Promise<SparepartTypeDto> {
    const response = await api.post<SparepartTypeDto>(SPAREPART_TYPE_PATH, data);
    return response.data;
  },

  /**
   * Update an existing sparepart type
   */
  async updateSparepartType(id: string, data: UpdateSparepartTypeDto): Promise<SparepartTypeDto> {
    const response = await api.put<SparepartTypeDto>(`${SPAREPART_TYPE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a sparepart type
   */
  async deleteSparepartType(id: string): Promise<void> {
    await api.delete(`${SPAREPART_TYPE_PATH}/${id}`);
  },

  /**
   * Get sparepart statistics
   */
  async getSparepartStats(): Promise<SparepartStats> {
    const response = await api.get<SparepartStats>(`${SPAREPART_PATH}/stats`);
    return response.data;
  },

  /**
   * Get low stock spareparts
   */
  async getLowStockSpareparts(): Promise<SparepartWithDetails[]> {
    const response = await api.get<SparepartWithDetails[]>(`${SPAREPART_PATH}/low-stock`);
    return response.data;
  },
};

export default sparepartService;