"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useWorkOrders } from "@/hooks/workorders/useWorkOrders";
import { getWorkOrderStatusLabel } from "@/entities/workorder.types";
import { approveWorkOrder, rejectWorkOrder } from "@/services/workOrderService";
import type { WorkOrder } from "@/entities/workorder.types";

export default function MemberWorkOrdersListPage() {
  const { data: workOrders, isLoading, refetch } = useWorkOrders();
  const [selectedOrder, setSelectedOrder] = React.useState<WorkOrder | null>(null);
  const [action, setAction] = React.useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'pending' | 'approved' | 'all'>('pending');

  const openActionDialog = (order: WorkOrder, actionType: 'approve' | 'reject') => {
    setSelectedOrder(order);
    setAction(actionType);
    setNotes('');
  };

  const closeDialog = () => {
    setSelectedOrder(null);
    setAction(null);
    setNotes('');
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;

    try {
      setIsProcessing(true);
      await approveWorkOrder(selectedOrder.id, notes || undefined);
      toast.success('Đã phê duyệt work order thành công');
      await refetch();
      closeDialog();
    } catch (error) {
      console.error('Failed to approve work order:', error);
      toast.error('Không thể phê duyệt work order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;

    try {
      setIsProcessing(true);
      await rejectWorkOrder(selectedOrder.id, notes || undefined);
      toast.success('Đã từ chối work order');
      await refetch();
      closeDialog();
    } catch (error) {
      console.error('Failed to reject work order:', error);
      toast.error('Không thể từ chối work order');
    } finally {
      setIsProcessing(false);
    }
  };

  const filterOrders = (orders: WorkOrder[] | undefined) => {
    if (!orders) return [];

    switch (activeTab) {
      case 'pending':
        return orders.filter(o => o.status === 'AwaitingApproval' || o.status === 'Revised');
      case 'approved':
        return orders.filter(o => o.status === 'Approved' || o.status === 'InProgress' || o.status === 'Completed');
      default:
        return orders;
    }
  };

  const filteredOrders = filterOrders(workOrders);
  const pendingCount = workOrders?.filter(o => o.status === 'AwaitingApproval' || o.status === 'Revised').length || 0;
  const approvedCount = workOrders?.filter(o => o.status === 'Approved' || o.status === 'InProgress' || o.status === 'Completed').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Đơn sửa chữa của tôi</h1>
          <p className="text-muted-foreground">
            Theo dõi trạng thái các work order và phê duyệt báo giá.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Work Order</CardTitle>
          <CardDescription>
            Chọn một đơn để xem chi tiết và phê duyệt báo giá.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                <Clock className="w-4 h-4 mr-2" />
                Chờ phê duyệt ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="approved">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Đã duyệt ({approvedCount})
              </TabsTrigger>
              <TabsTrigger value="all">
                Tất cả ({workOrders?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !filteredOrders || filteredOrders.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <FileText className="h-8 w-8" />
                  <p>Chưa có work order nào.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">#{order.id.slice(0, 8)}</p>
                          <Badge variant="outline">{getWorkOrderStatusLabel(order.status)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.vehicleInfo?.brand} {order.vehicleInfo?.model}
                        </p>
                        <p className="text-sm">{order.serviceType}</p>
                        {order.estimatedCost !== undefined && (
                          <p className="text-sm font-semibold text-primary">
                            Chi phí dự kiến:{" "}
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                              order.estimatedCost
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {(order.status === 'AwaitingApproval' || order.status === 'Revised') && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openActionDialog(order, 'approve')}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Phê duyệt
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openActionDialog(order, 'reject')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/member/workorders/${order.id}`}>Xem chi tiết</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approval/Rejection Dialog */}
      <Dialog open={!!selectedOrder && !!action} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Phê duyệt Work Order' : 'Từ chối Work Order'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? 'Xác nhận phê duyệt work order này. Kỹ thuật viên sẽ bắt đầu thực hiện công việc.'
                : 'Vui lòng cho biết lý do từ chối để kỹ thuật viên điều chỉnh.'}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              {/* Order Summary */}
              <div className="rounded-lg border p-3 bg-muted/50">
                <div className="text-sm font-medium mb-2">Thông tin Work Order</div>
                <div className="grid gap-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID:</span> #{selectedOrder.id.slice(0, 8)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Loại dịch vụ:</span> {selectedOrder.serviceType}
                  </div>
                  {selectedOrder.estimatedCost && (
                    <div>
                      <span className="text-muted-foreground">Chi phí:</span>{' '}
                      <span className="font-semibold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                          selectedOrder.estimatedCost
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  {action === 'approve' ? 'Ghi chú (tùy chọn)' : 'Lý do từ chối'}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={
                    action === 'approve'
                      ? 'Thêm ghi chú nếu cần...'
                      : 'Vui lòng nêu rõ lý do từ chối...'
                  }
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isProcessing}>
              Hủy
            </Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              onClick={action === 'approve' ? handleApprove : handleReject}
              disabled={isProcessing}
            >
              {isProcessing
                ? 'Đang xử lý...'
                : action === 'approve'
                  ? 'Xác nhận phê duyệt'
                  : 'Xác nhận từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
