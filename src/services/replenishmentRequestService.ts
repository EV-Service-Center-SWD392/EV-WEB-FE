import { api } from "./api";

interface CreateReplenishmentRequest {
  sparepartId: string;
  centerId: string;
  requestedQuantity: number;
  requestedBy: string;
  supplierId?: string;
  estimatedCost?: number;
  priority?: string;
  notes?: string;
  expectedDeliveryDate?: string;
  status?: string;
}

export const replenishmentRequestService = {
  async createRequest(data: CreateReplenishmentRequest) {
    const response = await api.post("/api/SparepartReplenishmentRequest", data);
    return response.data;
  },
};

export type { CreateReplenishmentRequest };