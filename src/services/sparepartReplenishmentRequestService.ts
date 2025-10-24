import {
  SparepartReplenishmentRequestDto,
  CreateSparepartReplenishmentRequestDto,
  UpdateSparepartReplenishmentRequestDto,
} from "@/entities/sparepart.types";

class SparepartReplenishmentRequestService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Helper method for API requests
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Replenishment Request CRUD operations
  async getAllRequests(): Promise<SparepartReplenishmentRequestDto[]> {
    return this.apiRequest<SparepartReplenishmentRequestDto[]>("/sparepartreplenishmentrequest");
  }

  async getRequestById(id: string): Promise<SparepartReplenishmentRequestDto> {
    return this.apiRequest<SparepartReplenishmentRequestDto>(`/sparepartreplenishmentrequest/${id}`);
  }

  async createRequest(data: CreateSparepartReplenishmentRequestDto): Promise<SparepartReplenishmentRequestDto> {
    return this.apiRequest<SparepartReplenishmentRequestDto>("/sparepartreplenishmentrequest", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRequest(id: string, data: UpdateSparepartReplenishmentRequestDto): Promise<SparepartReplenishmentRequestDto> {
    return this.apiRequest<SparepartReplenishmentRequestDto>(`/sparepartreplenishmentrequest/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteRequest(id: string): Promise<void> {
    await this.apiRequest<void>(`/sparepartreplenishmentrequest/${id}`, {
      method: "DELETE",
    });
  }

  // Specialized request operations
  async getRequestsBySparepart(sparepartId: string): Promise<SparepartReplenishmentRequestDto[]> {
    return this.apiRequest<SparepartReplenishmentRequestDto[]>(`/sparepartreplenishmentrequest/sparepart/${sparepartId}`);
  }

  async getRequestsByCenter(centerId: string): Promise<SparepartReplenishmentRequestDto[]> {
    return this.apiRequest<SparepartReplenishmentRequestDto[]>(`/sparepartreplenishmentrequest/center/${centerId}`);
  }

  async getRequestsByStatus(status: string): Promise<SparepartReplenishmentRequestDto[]> {
    return this.apiRequest<SparepartReplenishmentRequestDto[]>(`/sparepartreplenishmentrequest/status/${status}`);
  }

  async getPendingRequests(): Promise<SparepartReplenishmentRequestDto[]> {
    return this.apiRequest<SparepartReplenishmentRequestDto[]>("/sparepartreplenishmentrequest/pending");
  }

  async approveRequest(id: string, approvedBy: string): Promise<SparepartReplenishmentRequestDto> {
    return this.apiRequest<SparepartReplenishmentRequestDto>(`/sparepartreplenishmentrequest/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify({ approvedBy }),
    });
  }

  async rejectRequest(id: string, rejectedBy: string, reason: string): Promise<SparepartReplenishmentRequestDto> {
    return this.apiRequest<SparepartReplenishmentRequestDto>(`/sparepartreplenishmentrequest/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ rejectedBy, reason }),
    });
  }

  // Auto-generation of replenishment requests based on forecasts
  async generateRequestsFromForecasts(centerId?: string): Promise<{
    generatedRequests: SparepartReplenishmentRequestDto[];
    summary: {
      totalGenerated: number;
      totalAmount: number;
      urgentRequests: number;
    };
  }> {
    // Mock implementation - in real app, this would analyze forecasts and current inventory
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockRequests: SparepartReplenishmentRequestDto[] = [
      {
        id: `req_${Date.now()}_1`,
        centerId: centerId || "center_1",
        sparepartId: "sp_1",
        suggestedQuantity: 20,
        notes: "AI gợi ý: Dự báo thiếu hàng trong 2 tuần tới",
        status: "Pending",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: `req_${Date.now()}_2`,
        centerId: centerId || "center_1",
        sparepartId: "sp_2",
        suggestedQuantity: 15,
        notes: "AI gợi ý: Mức tồn kho dưới ngưỡng an toàn",
        status: "Pending",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    return {
      generatedRequests: mockRequests,
      summary: {
        totalGenerated: mockRequests.length,
        totalAmount: mockRequests.reduce((sum, req) => sum + (req.suggestedQuantity || 0), 0),
        urgentRequests: 1,
      },
    };
  }

  // Request analytics
  async getRequestStats(_centerId?: string): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    avgProcessingTime: number; // in hours
    totalRequestedValue: number;
  }> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      totalRequests: 45,
      pendingRequests: 12,
      approvedRequests: 28,
      rejectedRequests: 5,
      avgProcessingTime: 18.5,
      totalRequestedValue: 125000000, // VND
    };
  }

  // Bulk operations
  async bulkApproveRequests(requestIds: string[], approvedBy: string): Promise<{
    successCount: number;
    failureCount: number;
    results: { id: string; success: boolean; error?: string }[];
  }> {
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const id of requestIds) {
      try {
        await this.approveRequest(id, approvedBy);
        results.push({ id, success: true });
        successCount++;
      } catch (error) {
        results.push({ id, success: false, error: error instanceof Error ? error.message : "Unknown error" });
        failureCount++;
      }
    }

    return { successCount, failureCount, results };
  }

  async bulkRejectRequests(requestIds: string[], rejectedBy: string, reason: string): Promise<{
    successCount: number;
    failureCount: number;
    results: { id: string; success: boolean; error?: string }[];
  }> {
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const id of requestIds) {
      try {
        await this.rejectRequest(id, rejectedBy, reason);
        results.push({ id, success: true });
        successCount++;
      } catch (error) {
        results.push({ id, success: false, error: error instanceof Error ? error.message : "Unknown error" });
        failureCount++;
      }
    }

    return { successCount, failureCount, results };
  }
}

export const sparepartReplenishmentRequestService = new SparepartReplenishmentRequestService();