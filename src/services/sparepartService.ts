import {
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

class SparepartService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://evscmmsbe-production.up.railway.app";

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

  // Sparepart CRUD operations
  async getAllSpareparts(filters?: SparepartFilters): Promise<SparepartDto[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/sparepart${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.apiRequest<SparepartDto[]>(endpoint);
  }

  async getSparepartById(id: string): Promise<SparepartDto> {
    return this.apiRequest<SparepartDto>(`/sparepart/${id}`);
  }

  async createSparepart(data: CreateSparepartDto): Promise<SparepartDto> {
    return this.apiRequest<SparepartDto>("/sparepart", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSparepart(id: string, data: UpdateSparepartDto): Promise<SparepartDto> {
    return this.apiRequest<SparepartDto>(`/sparepart/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteSparepart(id: string): Promise<void> {
    await this.apiRequest<void>(`/sparepart/${id}`, {
      method: "DELETE",
    });
  }

  async searchSpareparts(searchTerm: string): Promise<SparepartDto[]> {
    return this.apiRequest<SparepartDto[]>(`/sparepart/search?searchTerm=${encodeURIComponent(searchTerm)}`);
  }

  async getSparepartsByType(typeId: string): Promise<SparepartDto[]> {
    return this.apiRequest<SparepartDto[]>(`/sparepart/type/${typeId}`);
  }

  async getSparepartsByVehicleModel(vehicleModelId: string): Promise<SparepartDto[]> {
    return this.apiRequest<SparepartDto[]>(`/sparepart/vehicle-model/${vehicleModelId}`);
  }

  async getSparepartsByManufacturer(manufacturer: string): Promise<SparepartDto[]> {
    return this.apiRequest<SparepartDto[]>(`/sparepart/manufacturer/${encodeURIComponent(manufacturer)}`);
  }

  // Sparepart Type operations
  async getAllSparepartTypes(): Promise<SparepartTypeDto[]> {
    return this.apiRequest<SparepartTypeDto[]>("/spareparttype");
  }

  async getSparepartTypeById(id: string): Promise<SparepartTypeDto> {
    return this.apiRequest<SparepartTypeDto>(`/spareparttype/${id}`);
  }

  async createSparepartType(data: CreateSparepartTypeDto): Promise<SparepartTypeDto> {
    return this.apiRequest<SparepartTypeDto>("/spareparttype", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSparepartType(id: string, data: UpdateSparepartTypeDto): Promise<SparepartTypeDto> {
    return this.apiRequest<SparepartTypeDto>(`/spareparttype/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteSparepartType(id: string): Promise<void> {
    await this.apiRequest<void>(`/spareparttype/${id}`, {
      method: "DELETE",
    });
  }

  // Statistics and analytics
  async getSparepartStats(): Promise<SparepartStats> {
    // Mock implementation - you might need to create this endpoint in backend
    const allSpareparts = await this.getAllSpareparts();
    const allTypes = await this.getAllSparepartTypes();
    
    return {
      totalSpareparts: allSpareparts.length,
      totalTypes: allTypes.length,
      lowStockCount: 0, // Would need inventory data
      outOfStockCount: 0, // Would need inventory data
      totalValue: 0, // Would need to calculate
      pendingForecasts: 0, // Would need forecast data
      pendingReplenishments: 0, // Would need replenishment data
    };
  }

  async getLowStockSpareparts(): Promise<SparepartWithDetails[]> {
    // This would need to be implemented in backend with inventory join
    const allSpareparts = await this.getAllSpareparts();
    // Mock implementation - in real app, backend should handle this
    return allSpareparts.map(sp => ({ ...sp, lowStock: true }));
  }
}

export const sparepartService = new SparepartService();