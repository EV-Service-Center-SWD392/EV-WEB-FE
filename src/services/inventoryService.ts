import {
  InventoryItem,
  CreateInventoryRequest,
  UpdateInventoryRequest,
  InventoryFilters,
} from "@/entities/inventory.types";

// Mock data for inventory
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
    minStock: 8, // Low stock warning
    isActive: true,
  },
  {
    id: "4",
    partName: "Đèn LED Matrix",
    serviceCenter: "Trung tâm Quận 5",
    quantity: 15,
    vehicleBrand: "Pega",
    vehicleType: "Xe đạp điện",
    unitPrice: 800000,
    addedDate: "2024-01-04T11:00:00Z",
    lastUpdated: "2024-01-14T09:00:00Z",
    minStock: 12,
    isActive: true,
  },
  {
    id: "5",
    partName: "Bộ sạc nhanh 150kW",
    serviceCenter: "Trung tâm Quận 2",
    quantity: 2,
    vehicleBrand: "VinFast",
    vehicleType: "Ô tô điện",
    unitPrice: 50000000,
    addedDate: "2024-01-05T14:00:00Z",
    lastUpdated: "2024-01-16T11:00:00Z",
    minStock: 3, // Low stock warning
    isActive: true,
  },
  {
    id: "6",
    partName: "Lốp xe không săm 120/70-12",
    serviceCenter: "Trung tâm Quận 9",
    quantity: 40,
    vehicleBrand: "Honda",
    vehicleType: "Xe máy điện",
    unitPrice: 450000,
    addedDate: "2024-01-06T15:30:00Z",
    lastUpdated: "2024-01-17T13:00:00Z",
    minStock: 20,
    isActive: true,
  },
  {
    id: "7",
    partName: "Cảm biến áp suất lốp TPMS",
    serviceCenter: "Trung tâm Thủ Đức",
    quantity: 0,
    vehicleBrand: "BMW",
    vehicleType: "Ô tô điện",
    unitPrice: 1200000,
    addedDate: "2024-01-07T16:00:00Z",
    lastUpdated: "2024-01-18T08:30:00Z",
    minStock: 6, // Out of stock
    isActive: false,
  },
];

class InventoryService {
  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get all inventory items with optional filters
  async getInventoryItems(
    filters: InventoryFilters = {}
  ): Promise<InventoryItem[]> {
    await this.delay();

    let filteredItems = [...mockInventory];

    // Apply filters
    if (filters.partName) {
      filteredItems = filteredItems.filter((item) =>
        item.partName.toLowerCase().includes(filters.partName!.toLowerCase())
      );
    }

    if (filters.serviceCenter) {
      filteredItems = filteredItems.filter((item) =>
        item.serviceCenter
          .toLowerCase()
          .includes(filters.serviceCenter!.toLowerCase())
      );
    }

    if (filters.vehicleBrand) {
      filteredItems = filteredItems.filter((item) =>
        item.vehicleBrand
          .toLowerCase()
          .includes(filters.vehicleBrand!.toLowerCase())
      );
    }

    if (filters.vehicleType) {
      filteredItems = filteredItems.filter((item) =>
        item.vehicleType
          .toLowerCase()
          .includes(filters.vehicleType!.toLowerCase())
      );
    }

    if (filters.lowStock !== undefined) {
      filteredItems = filteredItems.filter((item) =>
        filters.lowStock
          ? item.quantity <= item.minStock
          : item.quantity > item.minStock
      );
    }

    if (filters.isActive !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.isActive === filters.isActive
      );
    }

    // Apply sorting
    if (filters.sort) {
      filteredItems.sort((a, b) => {
        const aVal = a[filters.sort! as keyof InventoryItem];
        const bVal = b[filters.sort! as keyof InventoryItem];

        if (filters.sortOrder === "desc") {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    return filteredItems;
  }

  // Get inventory item by ID
  async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    await this.delay();
    return mockInventory.find((item) => item.id === id) || null;
  }

  // Create new inventory item
  async createInventoryItem(
    data: CreateInventoryRequest
  ): Promise<InventoryItem> {
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

  // Update inventory item
  async updateInventoryItem(
    id: string,
    data: UpdateInventoryRequest
  ): Promise<InventoryItem | null> {
    await this.delay();

    const index = mockInventory.findIndex((item) => item.id === id);
    if (index === -1) return null;

    mockInventory[index] = {
      ...mockInventory[index],
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    return mockInventory[index];
  }

  // Delete inventory item
  async deleteInventoryItem(id: string): Promise<boolean> {
    await this.delay();

    const index = mockInventory.findIndex((item) => item.id === id);
    if (index === -1) return false;

    mockInventory.splice(index, 1);
    return true;
  }

  // Update stock quantity (for quick adjustments)
  async updateStock(
    id: string,
    quantity: number
  ): Promise<InventoryItem | null> {
    return this.updateInventoryItem(id, { quantity });
  }

  // Get inventory statistics
  async getInventoryStats(): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    activeItems: number;
  }> {
    await this.delay();

    const activeItems = mockInventory.filter((item) => item.isActive);
    const lowStockItems = mockInventory.filter(
      (item) => item.quantity <= item.minStock && item.quantity > 0
    );
    const outOfStockItems = mockInventory.filter((item) => item.quantity === 0);

    const totalValue = mockInventory.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    return {
      totalItems: mockInventory.length,
      totalValue,
      lowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockItems.length,
      activeItems: activeItems.length,
    };
  }

  // Get low stock alerts
  async getLowStockAlerts(): Promise<InventoryItem[]> {
    await this.delay();

    return mockInventory
      .filter((item) => item.isActive && item.quantity <= item.minStock)
      .sort((a, b) => a.quantity - b.quantity); // Sort by lowest quantity first
  }
}

export const inventoryService = new InventoryService();
