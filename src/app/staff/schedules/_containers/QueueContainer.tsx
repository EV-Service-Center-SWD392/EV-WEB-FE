/**
 * Queue Container
 * Orchestrates business logic for Queue tab
 * Connects hooks, services, and QueueBoard organism
 */

"use client";

import * as React from "react";
import { toast } from "sonner";

import { QueueBoard } from "@/components/staff/scheduling/organisms/QueueBoard";
import {
  useCenters,
  useQueue,
  useReorderQueue,
  useMarkNoShow,
  useAddToQueue,
  useScheduleParams,
} from "@/hooks/scheduling";
import type { QueueTicket } from "@/entities/queue.types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const QueueContainer: React.FC = () => {
  // State from Zustand store
  const { centerId, selectedDate, setCenterId, setSelectedDate } = useScheduleParams();

  // Local state
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [queueForm, setQueueForm] = React.useState({
    serviceRequestId: "",
    priority: "2",
    reason: "",
  });

  // Data hooks
  const { data: centers = [], isLoading: isLoadingCenters } = useCenters();
  const {
    data: queueTickets = [],
    isLoading: isLoadingQueue,
    refetch: refetchQueue,
  } = useQueue({
    centerId: centerId || "",
    date: selectedDate,
  });

  // Mutations
  const reorderQueue = useReorderQueue();
  const markNoShow = useMarkNoShow();
  const addToQueue = useAddToQueue();

  // Handlers
  const handleCenterChange = (newCenterId: string) => {
    setCenterId(newCenterId);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  const handleReorder = async (reorderedTickets: QueueTicket[]) => {
    if (!centerId) return;

    try {
      const ticketIds = reorderedTickets.map((t) => t.id);
      await reorderQueue.mutateAsync({
        centerId,
        date: selectedDate,
        dto: { ticketIds },
      });
      toast.success("Đã cập nhật thứ tự hàng chờ");
    } catch (error) {
      toast.error("Lỗi khi sắp xếp hàng chờ");
      console.error("Reorder error:", error);
    }
  };

  const handleMarkNoShow = async (ticketId: string) => {
    try {
      await markNoShow.mutateAsync(ticketId);
      toast.success("Đã đánh dấu vắng mặt");
    } catch (error) {
      toast.error("Lỗi khi đánh dấu vắng mặt");
      console.error("Mark no-show error:", error);
    }
  };

  const handleOpenAddDialog = () => {
    if (!centerId) {
      toast.info("Vui lòng chọn trung tâm trước khi thêm hàng chờ");
      return;
    }
    setIsAddDialogOpen(true);
  };

  const handleCreateQueueTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!centerId) {
      toast.error("Thiếu thông tin trung tâm");
      return;
    }
    if (!queueForm.serviceRequestId.trim()) {
      toast.error("Vui lòng nhập mã yêu cầu dịch vụ");
      return;
    }

    try {
      await addToQueue.mutateAsync({
        centerId,
        serviceRequestId: queueForm.serviceRequestId.trim(),
        priority: queueForm.priority ? Number(queueForm.priority) : undefined,
        reason: queueForm.reason.trim() || undefined,
      });
      setIsAddDialogOpen(false);
      setQueueForm({ serviceRequestId: "", priority: "2", reason: "" });
      await refetchQueue();
    } catch (error) {
      console.error("Add to queue failed", error);
    }
  };

  const handleRefresh = async () => {
    await refetchQueue();
    toast.success("Đã làm mới hàng chờ");
  };

  return (
    <>
      <QueueBoard
        centers={centers}
        queueTickets={queueTickets}
        selectedCenterId={centerId}
        selectedDate={selectedDate}
        onCenterChange={handleCenterChange}
        onDateChange={handleDateChange}
        onReorder={handleReorder}
        onMarkNoShow={handleMarkNoShow}
        onAddToQueue={handleOpenAddDialog}
        onRefresh={handleRefresh}
        isLoadingCenters={isLoadingCenters}
        isLoadingQueue={isLoadingQueue}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm vào hàng chờ</DialogTitle>
            <DialogDescription>
              Ghi nhận khách walk-in cần hỗ trợ ngay tại trung tâm.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateQueueTicket} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Mã yêu cầu dịch vụ *
              </label>
              <Input
                value={queueForm.serviceRequestId}
                onChange={(event) =>
                  setQueueForm((prev) => ({
                    ...prev,
                    serviceRequestId: event.target.value,
                  }))
                }
                placeholder="request-xxx"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Mức ưu tiên
                </label>
                <Input
                  value={queueForm.priority}
                  onChange={(event) =>
                    setQueueForm((prev) => ({ ...prev, priority: event.target.value }))
                  }
                  placeholder="1 = ưu tiên cao"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Trung tâm
                </label>
                <Input value={centerId ?? ""} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ghi chú</label>
              <Textarea
                value={queueForm.reason}
                onChange={(event) =>
                  setQueueForm((prev) => ({ ...prev, reason: event.target.value }))
                }
                placeholder="Mô tả nhanh tình trạng hoặc yêu cầu của khách..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={addToQueue.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={addToQueue.isPending}>
                {addToQueue.isPending ? "Đang thêm..." : "Thêm vào hàng chờ"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
