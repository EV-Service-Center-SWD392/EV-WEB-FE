/**
 * Service Request API client
 */

import { api } from '@/services/api';

import type { ServiceRequest } from '../types/domain';
import type { CreateServiceRequestDTO, UpdateServiceRequestDTO } from '../types/dto';

const BASE_PATH = '/api/service-requests';

export const requestsService = {
  /**
   * Create a new service request
   */
  async postServiceRequest(dto: CreateServiceRequestDTO): Promise<ServiceRequest> {
    const response = await api.post<ServiceRequest>(BASE_PATH, dto);
    return response.data;
  },

  /**
   * Get a service request by ID
   */
  async getServiceRequest(id: string): Promise<ServiceRequest> {
    const response = await api.get<ServiceRequest>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Update a service request
   */
  async updateServiceRequest(id: string, dto: UpdateServiceRequestDTO): Promise<ServiceRequest> {
    const response = await api.patch<ServiceRequest>(`${BASE_PATH}/${id}`, dto);
    return response.data;
  },

  /**
   * List service requests with optional filters
   */
  async listServiceRequests(params?: {
    status?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ServiceRequest[]; total: number; page: number; limit: number }> {
    const response = await api.get<{
      data: ServiceRequest[];
      total: number;
      page: number;
      limit: number;
    }>(BASE_PATH, { params });
    return response.data;
  },

  /**
   * Check for duplicate service requests
   */
  async checkDuplicate(customerId: string, serviceTypeIds: string[]): Promise<{
    isDuplicate: boolean;
    existingRequestId?: string;
  }> {
    const response = await api.post<{
      isDuplicate: boolean;
      existingRequestId?: string;
    }>(`${BASE_PATH}/check-duplicate`, {
      customerId,
      serviceTypeIds,
    });
    return response.data;
  },
};
