"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "@/entities/inventory.types";

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (_item: InventoryItem) => void;
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

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return { text: "Hết hàng", color: "bg-red-100 text-red-800" };
    } else if (item.quantity <= item.minStock) {
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
                Linh kiện
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Xe tương thích
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trung tâm
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
            {items.map((item) => {
              const stockStatus = getStockStatus(item);
              const totalValue = item.quantity * item.unitPrice;

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.partName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cập nhật: {formatDate(item.lastUpdated)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.vehicleBrand}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.vehicleType}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.serviceCenter}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.quantity} / {item.minStock}
                      </div>
                      <div className="text-xs text-gray-500">
                        SL tối thiểu: {item.minStock}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQuickStockUpdate(item.id, item.quantity, -1)
                          }
                          className="h-6 w-6 p-0 text-xs"
                          disabled={item.quantity <= 0}
                        >
                          -
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQuickStockUpdate(item.id, item.quantity, 1)
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
                      {formatCurrency(item.unitPrice)}
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
                      <Badge
                        className={
                          item.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {item.isActive ? "Hoạt động" : "Tạm dừng"}
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
                        onClick={() => onDelete(item.id)}
                        className="bg-red-600 hover:bg-red-700"
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
            Không tìm thấy linh kiện nào phù hợp với bộ lọc hiện tại
          </div>
        </div>
      )}
    </div>
  );
}
