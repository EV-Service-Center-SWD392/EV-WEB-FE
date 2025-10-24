import {
  InventoryDto,
  CreateInventoryDto,
  UpdateInventoryDto,
  InventoryWithDetails,
  InventoryFilters,
  InventoryStats,
  // Legacy types for backward compatibility
  InventoryItem,
  CreateInventoryRequest,
  UpdateInventoryRequest,
} from "@/entities/inventory.types";

// Mock data for legacy support
const mockInventory: InventoryItem[] = [
  {
    id: "1",
    partName: "Pin Lithium 60V 20Ah",
    serviceCenter: "Trung tâm Quận 1",
    quantity: 25,
    vehicleBrand: "VinFast",
    vehicleType: "Xe máy điện",
    unitPrice: 8000000,
    addedDate: "2024-01-01T08:00:00Z",
    lastUpdated: "2024-01-10T10:00:00Z",
    minStock: 10,
    isActive: true,
  },
  {
    id: "2",
    partName: "Motor BLDC 3000W",
    serviceCenter: "Trung tâm Quận 7",
    quantity: 8,
    vehicleBrand: "Tesla",
    vehicleType: "Ô tô điện",
    unitPrice: 15000000,
    addedDate: "2024-01-02T09:00:00Z",
    lastUpdated: "2024-01-12T14:00:00Z",
    minStock: 5,
    isActive: true,
  },
  {
    id: "3",
    partName: "Phanh đĩa ABS",
    serviceCenter: "Trung tâm Quận 3",
    quantity: 3,
    vehicleBrand: "Gogoro",
    vehicleType: "Xe máy điện",
    unitPrice: 2500000,
    addedDate: "2024-01-03T10:30:00Z",
    lastUpdated: "2024-01-15T16:00:00Z",
    minStock: 8,
    isActive: true,
  },
];

class InventoryService {
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

  // Simulate API delay for development
  private delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // New API-based methods
  async getAllInventories(filters?: InventoryFilters): Promise<InventoryDto[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const endpoint = `/inventory${queryParams.toString() ? `?${queryParams}` : ""}`;
      return await this.apiRequest<InventoryDto[]>(endpoint);
    } catch (error) {
      console.warn("API call failed, using mock data:", error);
      // Fallback to mock data
      await this.delay();
      return [];
    }
  }

  async getInventoryById(id: string): Promise<InventoryDto | null> {
    try {
      return await this.apiRequest<InventoryDto>(`/inventory/${id}`);
    } catch (error) {
      console.warn("API call failed:", error);
      return null;
    }
  }

  async createInventory(data: CreateInventoryDto): Promise<InventoryDto> {
    return this.apiRequest<InventoryDto>("/inventory", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateInventory(id: string, data: UpdateInventoryDto): Promise<InventoryDto> {
    return this.apiRequest<InventoryDto>(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteInventory(id: string): Promise<void> {
    await this.apiRequest<void>(`/inventory/${id}`, {
      method: "DELETE",
    });
  }

  async getInventoriesByCenter(centerId: string): Promise<InventoryDto[]> {
    return this.apiRequest<InventoryDto[]>(`/inventory/center/${centerId}`);
  }

  async getLowStockInventories(): Promise<InventoryDto[]> {
    return this.apiRequest<InventoryDto[]>("/inventory/low-stock");
  }

  async updateQuantity(id: string, quantity: number): Promise<InventoryDto> {
    return this.apiRequest<InventoryDto>(`/inventory/${id}/quantity`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async getInventoryStats(centerId?: string): Promise<InventoryStats> {
    try {
      const queryParam = centerId ? `?centerId=${centerId}` : "";
      return await this.apiRequest<InventoryStats>(`/inventory/stats${queryParam}`);
    } catch (error) {
      console.warn("API call failed, using mock stats:", error);
      return {
        totalInventories: 7,
        totalQuantity: 98,
        totalValue: 123450000,
        lowStockCount: 3,
        outOfStockCount: 1,
        activeCenters: 6,
      };
    }
  }

  // Legacy methods for backward compatibility
  async getInventoryItems(filters: InventoryFilters = {}): Promise<InventoryItem[]> {
    await this.delay();
    return mockInventory.filter(item => {
      if (filters.lowStock !== undefined) {
        return filters.lowStock ? item.quantity <= item.minStock : item.quantity > item.minStock;
      }
      return true;
    });
  }

  async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    await this.delay();
    return mockInventory.find((item) => item.id === id) || null;
  }

  async createInventoryItem(data: CreateInventoryRequest): Promise<InventoryItem> {
    await this.delay();
    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      ...data,
      addedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isActive: true,
    };
    mockInventory.unshift(newItem);
    return newItem;
  }

  async updateInventoryItem(id: string, data: UpdateInventoryRequest): Promise<InventoryItem> {
    await this.delay();

    const itemIndex = mockInventory.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      throw new Error("Inventory item not found");
    }

    mockInventory[itemIndex] = {
      ...mockInventory[itemIndex],
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    return mockInventory[itemIndex];
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await this.delay();

    const itemIndex = mockInventory.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      throw new Error("Inventory item not found");
    }

    mockInventory.splice(itemIndex, 1);
  }

  async updateStock(id: string, quantity: number): Promise<InventoryItem> {
    await this.delay();

    const itemIndex = mockInventory.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      throw new Error("Inventory item not found");
    }

    mockInventory[itemIndex] = {
      ...mockInventory[itemIndex],
      quantity,
      lastUpdated: new Date().toISOString(),
    };

    return mockInventory[itemIndex];
  }

  async getLowStockAlerts(): Promise<InventoryItem[]> {
    await this.delay();
    return mockInventory
      .filter((item) => item.isActive && item.quantity <= item.minStock)
      .sort((a, b) => a.quantity - b.quantity);
  }
}

export const inventoryService = new InventoryService();
