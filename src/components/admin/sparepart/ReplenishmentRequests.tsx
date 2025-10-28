"use client";

import React, { useState } from "react";
import { 
  TrendingUp,
  Plus,
  Check,
  X,
  Clock,
  AlertCircle,
  RefreshCw,
  Package,
  Bot,
  FileText,
  ChevronRight
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { sparepartReplenishmentRequestService } from "@/services/sparepartReplenishmentRequestService";

import type { 
  SparepartReplenishmentRequestDto,
  SparepartDto 
} from "@/entities/sparepart.types";

interface ReplenishmentRequestsProps {
  requests: SparepartReplenishmentRequestDto[];
  spareparts: SparepartDto[];
  onUpdate: () => void;
}

export function ReplenishmentRequests({ requests, spareparts, onUpdate }: ReplenishmentRequestsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredRequests = selectedStatus === "all" 
    ? requests 
    : requests.filter(r => r.status?.toLowerCase() === selectedStatus.toLowerCase());

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      case "rejected":
        return <Badge variant="destructive">Bị từ chối</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Đang xử lý</Badge>;
      default:
        return <Badge variant="outline">{status || "N/A"}</Badge>;
    }
  };

  const getPriorityBadge = (suggestedQuantity: number) => {
    if (suggestedQuantity >= 50) {
      return <Badge variant="destructive">Khẩn cấp</Badge>;
    } else if (suggestedQuantity >= 20) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Cao</Badge>;
    } else {
      return <Badge variant="outline">Bình thường</Badge>;
    }
  };

  const getSparepartName = (sparepartId: string) => {
    const sparepart = spareparts.find(sp => sp.sparepartId === sparepartId);
    return sparepart?.name || `Phụ tùng #${sparepartId.slice(-8)}`;
  };

  const handleGenerateRequests = async () => {
    setIsGenerating(true);
    try {
      await sparepartReplenishmentRequestService.generateRequestsFromForecasts();
      onUpdate();
    } catch (error) {
      console.error("Error generating requests:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await sparepartReplenishmentRequestService.approveRequest(requestId, "admin_user");
      onUpdate();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await sparepartReplenishmentRequestService.rejectRequest(requestId, "admin_user", "Không cần thiết");
      onUpdate();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const requestStats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter(r => r.status === "Pending").length,
    approved: filteredRequests.filter(r => r.status === "Approved").length,
    rejected: filteredRequests.filter(r => r.status === "Rejected").length,
    totalQuantity: filteredRequests.reduce((sum, r) => sum + (r.suggestedQuantity || 0), 0),
    urgentRequests: filteredRequests.filter(r => (r.suggestedQuantity || 0) >= 50).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            Yêu cầu bổ sung phụ tùng
          </h2>
          <p className="text-gray-600 mt-1">
            Quản lý và phê duyệt các yêu cầu bổ sung phụ tùng tự động từ AI
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Tạo yêu cầu thủ công
          </Button>
          
          <Button 
            onClick={handleGenerateRequests}
            disabled={isGenerating}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bot className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? "Đang tạo..." : "Tạo yêu cầu AI"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng yêu cầu</p>
                <p className="text-2xl font-bold">{requestStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">{requestStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-600">{requestStats.approved}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Khẩn cấp</p>
                <p className="text-2xl font-bold text-red-600">{requestStats.urgentRequests}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số lượng</p>
                <p className="text-2xl font-bold">{requestStats.totalQuantity}</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỷ lệ duyệt</p>
                <p className="text-2xl font-bold">
                  {requestStats.total > 0 
                    ? Math.round((requestStats.approved / requestStats.total) * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Bot className="h-5 w-5" />
            Gợi ý từ AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-orange-100">
              <h4 className="font-medium text-gray-900 mb-2">Ưu tiên hàng đầu</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-red-500" />
                  Pin lithium 60V - Cần bổ sung 25 đơn vị ngay
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-orange-500" />
                  Motor BLDC 3000W - Thiếu 15 đơn vị trong tuần tới
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-yellow-500" />
                  Phanh đĩa ABS - Bổ sung 12 đơn vị để dự phòng
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-orange-100">
              <h4 className="font-medium text-gray-900 mb-2">Tối ưu hóa chi phí</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Nhóm đơn hàng để giảm 12% chi phí vận chuyển</p>
                <p>• Đặt hàng sớm để được giảm giá 8%</p>
                <p>• Ưu tiên nhà cung cấp địa phương</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc yêu cầu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Bị từ chối</option>
              <option value="processing">Đang xử lý</option>
            </select>
            
            <Badge variant="outline" className="text-green-600">
              {requests.filter(r => r.status === "Approved").length} Đã duyệt
            </Badge>
            <Badge variant="outline" className="text-yellow-600">
              {requests.filter(r => r.status === "Pending").length} Chờ duyệt
            </Badge>
            <Badge variant="outline" className="text-red-600">
              {requests.filter(r => (r.suggestedQuantity || 0) >= 50).length} Khẩn cấp
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu bổ sung</CardTitle>
          <CardDescription>
            Các yêu cầu bổ sung phụ tùng được tạo tự động và thủ công
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Phụ tùng</TableHead>
                <TableHead>Số lượng đề xuất</TableHead>
                <TableHead>Mức độ ưu tiên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <TrendingUp className="h-12 w-12 text-gray-300" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Chưa có yêu cầu nào</p>
                        <p className="text-gray-500">Tạo yêu cầu bổ sung tự động từ AI hoặc thủ công</p>
                      </div>
                      <Button 
                        onClick={handleGenerateRequests}
                        disabled={isGenerating}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        Tạo yêu cầu AI
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request, index) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium text-gray-900">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {getSparepartName(request.sparepartId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {request.id.slice(-8)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="font-medium text-orange-600">
                        {request.suggestedQuantity || 0} đơn vị
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      {getPriorityBadge(request.suggestedQuantity || 0)}
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(request.status || "Pending")}
                    </TableCell>
                    
                    <TableCell>
                      <div className="max-w-xs truncate text-gray-600">
                        {request.notes || "Không có ghi chú"}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-gray-500">
                        {request.createdAt ? 
                          new Date(request.createdAt).toLocaleDateString('vi-VN') : 
                          "N/A"
                        }
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {request.status === "Pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRequest(request.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
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
    </div>
  );
}