"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ShieldAlert, ClipboardList, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WorkOrderProgressTracker } from "@/components/workorders/WorkOrderProgressTracker";
import { useWorkOrderById, useUpdateWorkOrderStatus } from "@/hooks/workorders/useWorkOrders";
import { getWorkOrderStatusLabel } from "@/entities/workorder.types";

export default function MemberWorkOrderApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const workOrderId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id[0] : "";

  const { data: workOrder, isLoading } = useWorkOrderById(workOrderId, 15000);
  const updateStatus = useUpdateWorkOrderStatus();

  const handleDecision = async (status: "Approved" | "Revised" | "Rejected") => {
    if (!workOrder) return;
    try {
      await updateStatus.mutateAsync({ id: workOrder.id, status });
      const message =
        status === "Approved"
          ? "Đã phê duyệt đề xuất sửa chữa"
          : status === "Revised"
          ? "Đã yêu cầu điều chỉnh báo giá"
          : "Đã từ chối báo giá";
      toast.success(message);
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái đơn sửa chữa");
      console.error(error);
    }
  };

  if (!workOrderId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy mã Work Order</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Không tìm thấy Work Order</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Xem và phê duyệt đơn sửa chữa</h1>
          <p className="text-muted-foreground">
            Work Order #{workOrder.id.slice(0, 8)} • {getWorkOrderStatusLabel(workOrder.status)}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>

      <WorkOrderProgressTracker workOrder={workOrder} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin dịch vụ</CardTitle>
            <CardDescription>Chi tiết báo giá và hạng mục sửa chữa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Dịch vụ</p>
              <p className="font-medium">{workOrder.serviceType}</p>
            </div>
            {workOrder.estimatedCost !== undefined && (
              <div>
                <p className="text-muted-foreground">Chi phí dự kiến</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    workOrder.estimatedCost
                  )}
                </p>
              </div>
            )}
            {workOrder.partsRequired && (
              <div>
                <p className="text-muted-foreground">Phụ tùng / Vật tư</p>
                <p className="whitespace-pre-wrap font-medium">{workOrder.partsRequired}</p>
              </div>
            )}
            {workOrder.notes && (
              <div>
                <p className="text-muted-foreground">Ghi chú kỹ thuật</p>
                <p className="whitespace-pre-wrap">{workOrder.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nội dung kiểm tra</CardTitle>
            <CardDescription>Danh sách công việc dự kiến thực hiện</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {workOrder.tasks.length === 0 ? (
              <p className="text-muted-foreground">Chưa có hạng mục chi tiết.</p>
            ) : (
              workOrder.tasks.map((task) => (
                <div key={task.id} className="rounded-lg border p-3">
                  <p className="font-medium">{task.title}</p>
                  {task.description && (
                    <p className="text-muted-foreground text-xs mt-1">{task.description}</p>
                  )}
                  {task.estimatedMinutes && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Ước tính: {task.estimatedMinutes} phút
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quyết định của khách hàng</CardTitle>
          <CardDescription>
            Vui lòng duyệt báo giá hoặc yêu cầu điều chỉnh trước khi đội kỹ thuật bắt đầu.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleDecision('Revised')}
            disabled={updateStatus.isPending}
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Yêu cầu chỉnh sửa
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDecision('Rejected')}
            disabled={updateStatus.isPending}
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Từ chối
          </Button>
          <Button
            onClick={() => handleDecision('Approved')}
            disabled={updateStatus.isPending}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Phê duyệt
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
