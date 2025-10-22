"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Package,
  AlertCircle,
  Zap
} from "lucide-react";

import type { SparepartDto } from "@/entities/sparepart.types";

interface SparepartListProps {
  spareparts: SparepartDto[];
  onUpdate: () => void;
}

export function SparepartList({ spareparts, onUpdate }: SparepartListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredSpareparts = spareparts.filter(sp => {
    const matchesSearch = sp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sp.manufacture?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || sp.typeId === selectedType;
    const matchesStatus = selectedStatus === "all" || sp.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case "lowstock":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Tồn kho thấp</Badge>;
      case "outofstock":
        return <Badge variant="destructive">Hết hàng</Badge>;
      case "inactive":
        return <Badge variant="outline">Không hoạt động</Badge>;
      default:
        return <Badge variant="outline">{status || "N/A"}</Badge>;
    }
  };

  const handleEdit = (sparepart: SparepartDto) => {
    // Open edit dialog
    console.log("Edit sparepart:", sparepart);
  };

  const handleDelete = (sparepart: SparepartDto) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phụ tùng "${sparepart.name}"?`)) {
      // Delete sparepart
      console.log("Delete sparepart:", sparepart);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            Danh sách phụ tùng
          </h2>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả phụ tùng xe điện trong hệ thống
          </p>
        </div>
        
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Thêm phụ tùng mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc và tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm phụ tùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Tất cả loại</option>
              <option value="battery">Pin</option>
              <option value="motor">Motor</option>
              <option value="brake">Phanh</option>
              <option value="light">Đèn</option>
              <option value="tire">Lốp</option>
              <option value="sensor">Cảm biến</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="lowstock">Tồn kho thấp</option>
              <option value="outofstock">Hết hàng</option>
              <option value="inactive">Không hoạt động</option>
            </select>
            
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Lọc nâng cao
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Hiển thị {filteredSpareparts.length} / {spareparts.length} phụ tùng
        </p>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            {spareparts.filter(sp => sp.status === "active").length} Hoạt động
          </Badge>
          <Badge variant="outline" className="text-yellow-600">
            {spareparts.filter(sp => sp.status === "lowstock").length} Tồn kho thấp
          </Badge>
          <Badge variant="outline" className="text-red-600">
            {spareparts.filter(sp => sp.status === "outofstock").length} Hết hàng
          </Badge>
        </div>
      </div>

      {/* Spareparts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên phụ tùng</TableHead>
                <TableHead>Nhà sản xuất</TableHead>
                <TableHead>Giá đơn vị</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Model xe</TableHead>
                <TableHead>Ngày cập nhật</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpareparts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Package className="h-12 w-12 text-gray-300" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Không tìm thấy phụ tùng</p>
                        <p className="text-gray-500">Thử điều chỉnh bộ lọc hoặc thêm phụ tùng mới</p>
                      </div>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm phụ tùng đầu tiên
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSpareparts.map((sparepart) => (
                  <TableRow key={sparepart.sparepartId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {sparepart.status === "outofstock" ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : sparepart.status === "lowstock" ? (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <Zap className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{sparepart.name}</p>
                          <p className="text-sm text-gray-500">ID: {sparepart.sparepartId.slice(-8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-gray-700">{sparepart.manufacture || "N/A"}</span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="font-medium text-green-600">
                        {formatCurrency(sparepart.unitPrice || 0)}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(sparepart.status || "active")}
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-gray-700">
                        {sparepart.vehicleModelId ? `Model #${sparepart.vehicleModelId}` : "Tất cả"}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-gray-500">
                        {sparepart.updatedAt ? 
                          new Date(sparepart.updatedAt).toLocaleDateString('vi-VN') : 
                          "N/A"
                        }
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(sparepart)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(sparepart)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredSpareparts.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Trang 1 của 1
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Trước
            </Button>
            <Button variant="outline" size="sm" disabled>
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}