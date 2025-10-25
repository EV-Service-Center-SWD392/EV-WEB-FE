import type {
  SparepartReplenishmentRequestDto,
  CreateSparepartReplenishmentRequestDto,
  UpdateSparepartReplenishmentRequestDto,
} from "@/entities/sparepart.types";

import { api } from "./api";

const REPLENISHMENT_PATH = "/api/sparepartreplenishmentrequest";

/**
 * Sparepart Replenishment Request Service
 * Manages sparepart replenishment request operations
 */
export const sparepartReplenishmentRequestService = {
  /**
   * Get all requests
   */
  async getAllRequests(): Promise<SparepartReplenishmentRequestDto[]> {
    const response = await api.get<SparepartReplenishmentRequestDto[]>(REPLENISHMENT_PATH);
    return response.data;
  },

  /**
   * Get a single request by ID
   */
  async getRequestById(id: string): Promise<SparepartReplenishmentRequestDto> {
    const response = await api.get<SparepartReplenishmentRequestDto>(`${REPLENISHMENT_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create a new request
   */
  async createRequest(data: CreateSparepartReplenishmentRequestDto): Promise<SparepartReplenishmentRequestDto> {
    const response = await api.post<SparepartReplenishmentRequestDto>(REPLENISHMENT_PATH, data);
    return response.data;
  },

  /**
   * Update an existing request
   */
  async updateRequest(id: string, data: UpdateSparepartReplenishmentRequestDto): Promise<SparepartReplenishmentRequestDto> {
    const response = await api.put<SparepartReplenishmentRequestDto>(`${REPLENISHMENT_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a request
   */
  async deleteRequest(id: string): Promise<void> {
    await api.delete(`${REPLENISHMENT_PATH}/${id}`);
  },

  /**
   * Get requests by sparepart
   */
  async getRequestsBySparepart(sparepartId: string): Promise<SparepartReplenishmentRequestDto[]> {
    const response = await api.get<SparepartReplenishmentRequestDto[]>(`${REPLENISHMENT_PATH}/sparepart/${sparepartId}`);
    return response.data;
  },

  /**
   * Get requests by center
   */
  async getRequestsByCenter(centerId: string): Promise<SparepartReplenishmentRequestDto[]> {
    const response = await api.get<SparepartReplenishmentRequestDto[]>(`${REPLENISHMENT_PATH}/center/${centerId}`);
    return response.data;
  },

  /**
   * Get requests by status
   */
  async getRequestsByStatus(status: string): Promise<SparepartReplenishmentRequestDto[]> {
    const response = await api.get<SparepartReplenishmentRequestDto[]>(`${REPLENISHMENT_PATH}/status/${status}`);
    return response.data;
  },

  /**
   * Get pending requests
   */
  async getPendingRequests(): Promise<SparepartReplenishmentRequestDto[]> {
    const response = await api.get<SparepartReplenishmentRequestDto[]>(`${REPLENISHMENT_PATH}/pending`);
    return response.data;
  },

  /**
   * Approve a request
   */
  async approveRequest(id: string, approvedBy: string): Promise<SparepartReplenishmentRequestDto> {
    const response = await api.put<SparepartReplenishmentRequestDto>(`${REPLENISHMENT_PATH}/${id}/approve`, { approvedBy });
    return response.data;
  },

  /**
   * Reject a request
   */
  async rejectRequest(id: string, rejectedBy: string, reason: string): Promise<SparepartReplenishmentRequestDto> {
    const response = await api.put<SparepartReplenishmentRequestDto>(`${REPLENISHMENT_PATH}/${id}/reject`, { rejectedBy, reason });
    return response.data;
  },

  /**
   * Generate requests from forecasts
   */
  async generateRequestsFromForecasts(centerId?: string): Promise<{
    generatedRequests: SparepartReplenishmentRequestDto[];
    summary: {
      totalGenerated: number;
      totalAmount: number;
      urgentRequests: number;
    };
  }> {
    const response = await api.post(`${REPLENISHMENT_PATH}/generate-from-forecasts`, {
      centerId,
    });
    return response.data;
  },

  /**
   * Get request statistics
   */
  async getRequestStats(centerId?: string): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    avgProcessingTime: number;
    totalRequestedValue: number;
  }> {
    const response = await api.get(`${REPLENISHMENT_PATH}/stats`, {
      params: centerId ? { centerId } : undefined,
    });
    return response.data;
  },

  /**
   * Bulk approve requests
   */
  async bulkApproveRequests(requestIds: string[], approvedBy: string): Promise<{
    successCount: number;
    failureCount: number;
    results: { id: string; success: boolean; error?: string }[];
  }> {
    const response = await api.put(`${REPLENISHMENT_PATH}/bulk-approve`, {
      requestIds,
      approvedBy,
    });
    return response.data;
  },

  /**
   * Bulk reject requests
   */
  async bulkRejectRequests(requestIds: string[], rejectedBy: string, reason: string): Promise<{
    successCount: number;
    failureCount: number;
    results: { id: string; success: boolean; error?: string }[];
  }> {
    const response = await api.put(`${REPLENISHMENT_PATH}/bulk-reject`, {
      requestIds,
      rejectedBy,
      reason,
    });
    return response.data;
  },
};

export default sparepartReplenishmentRequestService;