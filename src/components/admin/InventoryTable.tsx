"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { InventoryDto } from "@/entities/inventory.types";

interface InventoryTableProps {
  items: InventoryDto[];
  onEdit: (_item: InventoryDto) => void;
  onDelete: (_itemId: string) => void;
  onUpdateStock: (_itemId: string, _quantity: number) => void;
}

export function InventoryTable({
  items,
  onEdit,
  onDelete,
  onUpdateStock,
}: InventoryTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStockStatus = (item: InventoryDto) => {
    const quantity = item.quantity || 0;
    const minStock = item.minimumStockLevel || 0;
    if (quantity === 0) {
      return { text: "Hết hàng", color: "bg-red-100 text-red-800" };
    } else if (quantity <= minStock) {
      return { text: "Sắp hết", color: "bg-yellow-100 text-yellow-800" };
    }
    return { text: "Còn hàng", color: "bg-green-100 text-green-800" };
  };

  const handleQuickStockUpdate = (
    itemId: string,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = Math.max(0, currentQuantity + change);
    onUpdateStock(itemId, newQuantity);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inventory ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Center ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tồn kho
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đơn giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá trị
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => {
              const stockStatus = getStockStatus(item);
              const quantity = item.quantity || 0;
              const minStock = item.minimumStockLevel || 0;
              const totalValue = quantity * 100000; // Mock unit price

              return (
                <tr key={item.inventoryId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.inventoryId}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cập nhật: {item.updatedAt ? formatDate(item.updatedAt) : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.centerId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <Badge
                        className={
                          item.status === 'ACTIVE'
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {item.status === 'ACTIVE' ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {quantity} / {minStock}
                      </div>
                      <div className="text-xs text-gray-500">
                        SL tối thiểu: {minStock}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQuickStockUpdate(item.inventoryId, quantity, -1)
                          }
                          className="h-6 w-6 p-0 text-xs"
                          disabled={quantity <= 0}
                        >
                          -
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQuickStockUpdate(item.inventoryId, quantity, 1)
                          }
                          className="h-6 w-6 p-0 text-xs"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(100000)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(totalValue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <Badge className={stockStatus.color}>
                        {stockStatus.text}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(item.inventoryId)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Không có dữ liệu</div>
          <div className="text-gray-400 text-sm mt-2">
            Không tìm thấy inventory nào phù hợp với bộ lọc hiện tại
          </div>
        </div>
      )}
    </div>
  );
}
