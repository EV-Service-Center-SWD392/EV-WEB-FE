"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkOrderForm } from "@/components/workorders";
import { useIntakeById } from "@/hooks/intake";
import { useCreateWorkOrder, useWorkOrdersByIntake } from "@/hooks/workorders/useWorkOrders";
import { staffDirectoryService } from "@/services/staffDirectoryService";
import type { Technician } from "@/entities/slot.types";
import type { CreateWorkOrderRequest } from "@/entities/workorder.types";
import { getWorkOrderStatusLabel } from "@/entities/workorder.types";

const formatVehicleInfo = (
  vehicleBrand?: string,
  vehicleType?: string,
  licensePlate?: string,
) => {
  const parts = [vehicleBrand, vehicleType, licensePlate].filter(Boolean);
  return parts.length > 0 ? parts.join(" • ") : undefined;
};

type IntakeWorkOrderMode = "staff" | "technician";

interface IntakeWorkOrderViewProps {
  intakeId: string;
  mode?: IntakeWorkOrderMode;
}

export function IntakeWorkOrderView({ intakeId, mode = "staff" }: IntakeWorkOrderViewProps) {
  const router = useRouter();

  const { data: intake, isLoading: isLoadingIntake } = useIntakeById(intakeId);
  const { data: existingWorkOrders = [], isLoading: isLoadingWorkOrders } = useWorkOrdersByIntake(intakeId);
  const createWorkOrder = useCreateWorkOrder();

  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = React.useState(false);

  const hasWorkOrder = existingWorkOrders.length > 0;
  const currentWorkOrder = hasWorkOrder ? existingWorkOrders[0] : null;
  const isPageLoading = isLoadingIntake || isLoadingWorkOrders;

  React.useEffect(() => {
    if (!intake?.centerId) return;

    setIsLoadingTechnicians(true);
    staffDirectoryService
      .getTechnicians(intake.centerId)
      .then((data) => setTechnicians(data))
      .catch((error) => {
        console.error("Failed to load technicians for work order creation", error);
        toast.error("Không thể tải danh sách kỹ thuật viên");
      })
      .finally(() => setIsLoadingTechnicians(false));
  }, [intake?.centerId]);

  const intakeOptions = React.useMemo(() => {
    if (!intake) return [];
    return [
      {
        id: intake.id,
        bookingId: intake.bookingCode ?? intake.bookingId ?? "WALK-IN",
        vehicleInfo: formatVehicleInfo(intake.vehicleBrand, intake.vehicleType, intake.licensePlate),
        customerName: intake.customerName ?? "Khách vãng lai",
      },
    ];
  }, [intake]);

  const defaultTechnicianId = React.useMemo(() => {
    return technicians.length === 1 ? technicians[0].id : undefined;
  }, [technicians]);

  const handleNavigateBack = React.useCallback(() => {
    if (mode === "staff") {
      router.back();
    } else {
      router.push("/technician/workorders");
    }
  }, [mode, router]);

  const handleNavigateToWorkOrder = React.useCallback(
    (workOrderId: string) => {
      if (mode === "staff") {
        router.push(`/staff/workorders/${workOrderId}`);
      } else {
        router.push("/technician/workorders");
      }
    },
    [mode, router],
  );

  const handleCreateWorkOrder = React.useCallback(
    async (payload: CreateWorkOrderRequest) => {
      try {
        const workOrder = await createWorkOrder.mutateAsync(payload);
        handleNavigateToWorkOrder(workOrder.id);
      } catch (error) {
        console.error("Create work order failed", error);
      }
    },
    [createWorkOrder, handleNavigateToWorkOrder],
  );

  if (!intakeId) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
        <p>Không xác định được mã intake.</p>
        <Button variant="outline" onClick={handleNavigateBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!intake) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
        <p>Không tìm thấy thông tin intake.</p>
        <Button
          variant="outline"
          onClick={() => {
            if (mode === "staff") {
              router.push("/staff/intake-list");
            } else {
              router.push("/technician/workorders");
            }
          }}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleNavigateBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo Work Order</h1>
          <p className="text-sm text-muted-foreground">
            Intake #{intake.id.slice(0, 8)} • {intake.customerName ?? "Khách vãng lai"} •{" "}
            {formatVehicleInfo(intake.vehicleBrand, intake.vehicleType, intake.licensePlate) ?? "Xe chưa cập nhật"}
          </p>
        </div>
      </div>

      {hasWorkOrder && currentWorkOrder ? (
        <Card>
          <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Work Order đã tồn tại</CardTitle>
              <CardDescription>
                Intake này đã có work order ở trạng thái {getWorkOrderStatusLabel(currentWorkOrder.status)}.
              </CardDescription>
            </div>
            <Button onClick={() => handleNavigateToWorkOrder(currentWorkOrder.id)}>Xem chi tiết Work Order</Button>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Mã Work Order</p>
              <p className="font-medium">#{currentWorkOrder.id.slice(0, 8)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Loại dịch vụ</p>
              <p className="font-medium">{currentWorkOrder.serviceType}</p>
            </div>
            {currentWorkOrder.technicianName && (
              <div>
                <p className="text-muted-foreground">Kỹ thuật viên</p>
                <p className="font-medium">{currentWorkOrder.technicianName}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Số hạng mục</p>
              <p className="font-medium">{currentWorkOrder.tasks.length}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Khởi tạo Work Order</CardTitle>
            <CardDescription>
              Hoàn thiện báo giá sửa chữa dựa trên checklist đã kiểm tra cùng khách hàng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {intakeOptions.length === 0 ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : (
              <WorkOrderForm
                intakes={intakeOptions}
                technicians={technicians}
                onSubmitAction={handleCreateWorkOrder}
                isLoading={createWorkOrder.isPending || isLoadingTechnicians}
                defaultIntakeId={intake.id}
                defaultTechnicianId={defaultTechnicianId}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
