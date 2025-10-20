/**
 * Vehicle API client
 */

import { api } from '@/services/api';

import type { Vehicle } from '../types/domain';
import type { QuickVehicleDTO } from '../types/dto';

const BASE_PATH = '/api/vehicles';

export const vehiclesService = {
  /**
   * Create a new vehicle (quick create)
   */
  async createVehicle(dto: QuickVehicleDTO): Promise<Vehicle> {
    const response = await api.post<Vehicle>(BASE_PATH, dto);
    return response.data;
  },

  /**
   * Get a vehicle by ID
   */
  async getVehicle(id: string): Promise<Vehicle> {
    const response = await api.get<Vehicle>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * List vehicles with optional filters
   */
  async listVehicles(params?: {
    customerId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Vehicle[]; total: number }> {
    const response = await api.get<{ data: Vehicle[]; total: number }>(BASE_PATH, { params });
    return response.data;
  },
};
