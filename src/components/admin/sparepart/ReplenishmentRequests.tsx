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
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { sparepartReplenishmentRequestService } from "@/services/sparepartReplenishmentRequestService";
import { useAuthStore } from "@/stores/auth";

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
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Filter and sort requests by createdAt (newest first)
  const filteredRequests = (selectedStatus === "all" 
    ? requests 
    : requests.filter((r: SparepartReplenishmentRequestDto) => r.status?.toLowerCase() === selectedStatus.toLowerCase()))
    .sort((a, b) => {
      // Sort by requestDate (newest first), fallback to createdAt if requestDate is not available
      const dateA = new Date(a.requestDate || a.createdAt || 0).getTime();
      const dateB = new Date(b.requestDate || b.createdAt || 0).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case "PENDING":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Bị từ chối</Badge>;
      case "PROCESSING":
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
      // Call API to generate requests - adjust this based on your actual API
      await sparepartReplenishmentRequestService.getAllRequests();
      onUpdate();
    } catch (error) {
      console.error("Error generating requests:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (processingIds.has(requestId)) return;
    
    if (!user?.id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }
    
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await sparepartReplenishmentRequestService.approveRequest(requestId, user.id);
      toast.success("Đã chấp nhận yêu cầu bổ sung");
      onUpdate();
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Lỗi khi duyệt yêu cầu. Vui lòng thử lại.");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (processingIds.has(requestId)) return;
    
    if (!user?.id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }
    
    const reason = prompt("Nhập lý do từ chối (tối thiểu 10 ký tự):");
    if (!reason || reason.trim().length < 10) {
      toast.error("Lý do từ chối phải có ít nhất 10 ký tự");
      return;
    }

    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await sparepartReplenishmentRequestService.rejectRequest(requestId, user.id, reason.trim());
      toast.success("Đã từ chối yêu cầu bổ sung");
      onUpdate();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Lỗi khi từ chối yêu cầu. Vui lòng thử lại.");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const requestStats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter((r: SparepartReplenishmentRequestDto) => r.status?.toUpperCase() === "PENDING").length,
    approved: filteredRequests.filter((r: SparepartReplenishmentRequestDto) => r.status?.toUpperCase() === "APPROVED").length,
    rejected: filteredRequests.filter((r: SparepartReplenishmentRequestDto) => r.status?.toUpperCase() === "REJECTED").length,
    totalQuantity: filteredRequests.reduce((sum: number, r: SparepartReplenishmentRequestDto) => sum + (r.requestedQuantity || 0), 0),
    urgentRequests: filteredRequests.filter((r: SparepartReplenishmentRequestDto) => (r.requestedQuantity || 0) >= 50).length,
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

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${selectedStatus === "all"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Tất cả
            <Badge variant="outline" className="ml-2">
              {requests.length}
            </Badge>
          </button>
          
          <button
            onClick={() => setSelectedStatus("pending")}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${selectedStatus === "pending"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Chờ duyệt
            <Badge variant="outline" className="ml-2 text-yellow-600">
              {requests.filter((r: SparepartReplenishmentRequestDto) => r.status?.toUpperCase() === "PENDING").length}
            </Badge>
          </button>
          
          <button
            onClick={() => setSelectedStatus("approved")}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${selectedStatus === "approved"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Đã duyệt
            <Badge variant="outline" className="ml-2 text-green-600">
              {requests.filter((r: SparepartReplenishmentRequestDto) => r.status?.toUpperCase() === "APPROVED").length}
            </Badge>
          </button>
          
          <button
            onClick={() => setSelectedStatus("rejected")}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${selectedStatus === "rejected"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Đã từ chối
            <Badge variant="outline" className="ml-2 text-red-600">
              {requests.filter((r: SparepartReplenishmentRequestDto) => r.status?.toUpperCase() === "REJECTED").length}
            </Badge>
          </button>
        </nav>
      </div>

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
              {paginatedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <TrendingUp className="h-12 w-12 text-gray-300" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Chưa có yêu cầu nào</p>
                        <p className="text-gray-500">Tạo yêu cầu tự động từ AI hoặc thủ công</p>
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
                paginatedRequests.map((request: SparepartReplenishmentRequestDto, index: number) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium text-gray-900">
                      {startIndex + index + 1}
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
                        {request.requestedQuantity || 0} đơn vị
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      {getPriorityBadge(request.requestedQuantity || 0)}
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(request.status || "PENDING")}
                    </TableCell>
                    
                    <TableCell>
                      <div className="max-w-xs truncate text-gray-600">
                        {request.notes || "N/A"}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-gray-500">
                        {request.requestDate ? 
                          new Date(request.requestDate).toLocaleDateString('vi-VN') : 
                          "N/A"
                        }
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {request.status?.toUpperCase() === "PENDING" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={processingIds.has(request.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              {processingIds.has(request.id) ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={processingIds.has(request.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {processingIds.has(request.id) ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
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

          {/* Pagination Controls */}
          {filteredRequests.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredRequests.length)}</span> trong{' '}
                  <span className="font-medium">{filteredRequests.length}</span> yêu cầu
                </div>
                
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value={5}>5 / trang</option>
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-700">
                    Trang <span className="font-medium">{currentPage}</span> /{' '}
                    <span className="font-medium">{totalPages}</span>
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}