"use client";

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { InventoryFilters } from "@/components/admin/InventoryFilters";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { InventoryForm } from "@/components/admin/InventoryForm";
import { inventoryService } from "@/services/inventoryService";
import type {
  InventoryDto,
  InventoryFilters as InventoryFiltersType,
  InventoryStats,
  CreateInventoryDto,
  UpdateInventoryDto,
} from "@/entities/inventory.types";

export default function ManagerInventoryPage() {
  const [items, setItems] = useState<InventoryDto[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryDto[]>([]);
  const [filters, setFilters] = useState<InventoryFiltersType>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryDto | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [stats, setStats] = useState<InventoryStats>({
    totalInventories: 0,
    totalQuantity: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    activeCenters: 0,
  });

  // Load inventory items on component mount
  useEffect(() => {
    loadInventoryItems();
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInventoryItems = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryService.getAllInventories(filters);
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error("Error loading inventory items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await inventoryService.getInventoryStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryService.getAllInventories(filters);
      setFilteredItems(data);
    } catch (error) {
      console.error("Error searching inventory items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    const emptyFilters: InventoryFiltersType = {};
    setFilters(emptyFilters);
    setFilteredItems(items);
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: InventoryDto) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa linh kiện này?")) {
      return;
    }

    try {
      await inventoryService.deleteInventory(itemId);
      await loadInventoryItems(); // Reload data
      await loadStats();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Có lỗi xảy ra khi xóa linh kiện");
    }
  };

  const handleUpdateStock = async (itemId: string, quantity: number) => {
    try {
      await inventoryService.updateQuantity(itemId, quantity);
      await loadInventoryItems(); // Reload data
      await loadStats();
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Có lỗi xảy ra khi cập nhật tồn kho");
    }
  };

  const handleFormSubmit = async (
    data: CreateInventoryDto | UpdateInventoryDto
  ) => {
    try {
      setIsFormLoading(true);

      if (editingItem) {
        // Update item
        await inventoryService.updateInventory(
          editingItem.inventoryId,
          data as UpdateInventoryDto
        );
      } else {
        // Create new item
        await inventoryService.createInventory(
          data as CreateInventoryDto
        );
      }

      setIsFormOpen(false);
      setEditingItem(null);
      await loadInventoryItems(); // Reload data
      await loadStats();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Có lỗi xảy ra khi lưu dữ liệu");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý kho hàng
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý linh kiện và phụ tùng xe điện trong kho
            </p>
          </div>
          <Button
            onClick={handleCreateItem}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            Thêm linh kiện
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tổng linh kiện</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalInventories}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Giá trị tổng</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalValue)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-red-600">Tồn kho thấp</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.lowStockCount}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-red-600">Hết hàng</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.outOfStockCount}
          </div>
        </div>
      </div>

      {/* Filters */}
      <InventoryFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        onReset={handleResetFilters}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      )}

      {/* Inventory table */}
      {!isLoading && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredItems.length} / {items.length} linh kiện
            </div>
            {stats.lowStockCount > 0 && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-md">
                ⚠️ Có {stats.lowStockCount} linh kiện sắp hết hàng
              </div>
            )}
          </div>

          <InventoryTable
            items={filteredItems}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onUpdateStock={handleUpdateStock}
          />
        </>
      )}

      {/* Inventory Form Modal */}
      <InventoryForm
        item={editingItem}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />
    </div>
  );
}
