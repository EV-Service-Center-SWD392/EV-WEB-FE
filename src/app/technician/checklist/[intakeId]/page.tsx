"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckSquare, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChecklistTable } from "@/components/staff/intake/ChecklistTable";
import {
  useChecklist,
  useChecklistByCategory,
  useSaveChecklistResponses,
} from "@/hooks/intake/useChecklist";
import { useIntakeById, useUpdateIntake } from "@/hooks/intake";
import type { ChecklistResponse } from "@/entities/intake.types";

const toArrayFromMap = (map: Map<string, Partial<ChecklistResponse>>) =>
  Array.from(map.values()).filter((resp) => resp.checklistItemId);

export default function TechnicianChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const intakeIdParam = Array.isArray(params?.intakeId) ? params?.intakeId[0] : params?.intakeId;
  const intakeId = intakeIdParam || "";

  const { data: intake, isLoading: isLoadingIntake } = useIntakeById(intakeId);
  const { items, responses = [], isLoading: isLoadingChecklist } = useChecklist(intakeId);
  const checklistGroups = useChecklistByCategory(items);
  const saveResponses = useSaveChecklistResponses(intakeId);
  const updateIntake = useUpdateIntake();

  const [pendingResponses, setPendingResponses] = React.useState<Map<string, Partial<ChecklistResponse>>>(
    new Map()
  );
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingAction, setProcessingAction] = React.useState<"save" | "submit" | null>(null);
  const isBusy = isProcessing || saveResponses.isPending || updateIntake.isPending;

  const handleResponseChange = React.useCallback((response: Partial<ChecklistResponse>) => {
    if (!response.checklistItemId) return;
    setPendingResponses((prev) => {
      const next = new Map(prev);
      next.set(response.checklistItemId!, response);
      return next;
    });
  }, []);

  const persistPendingResponses = React.useCallback(async () => {
    if (pendingResponses.size === 0) {
      return false;
    }
    await saveResponses.mutateAsync({
      responses: toArrayFromMap(pendingResponses).map((response) => ({
        checklistItemId: response.checklistItemId!,
        boolValue: response.boolValue,
        numberValue: response.numberValue,
        textValue: response.textValue,
        severity: response.severity,
        note: response.note,
        photoUrl: response.photoUrl,
      })),
    });
    setPendingResponses(new Map());
    return true;
  }, [pendingResponses, saveResponses]);

  const handleSaveDraft = React.useCallback(async () => {
    if (!intakeId) return;
    if (pendingResponses.size === 0) {
      toast.info("Không có thay đổi để lưu");
      return;
    }
    setProcessingAction("save");
    setIsProcessing(true);
    try {
      await persistPendingResponses();
      if (intake?.status === "CHECKED_IN") {
        await updateIntake.mutateAsync({
          intakeId,
          data: {}, // Empty data to trigger status transition
        });
      }
      toast.success("Đã lưu bản nháp checklist");
    } catch (error) {
      console.error("Save checklist draft failed", error);
      toast.error("Không thể lưu checklist, vui lòng thử lại");
    } finally {
      setProcessingAction(null);
      setIsProcessing(false);
    }
  }, [intakeId, intake?.status, pendingResponses, persistPendingResponses, updateIntake]);

  const handleSubmitChecklist = React.useCallback(async () => {
    if (!intakeId) return;
    setProcessingAction("submit");
    setIsProcessing(true);
    try {
      await persistPendingResponses();
      if (intake?.status === "CHECKED_IN") {
        await updateIntake.mutateAsync({
          intakeId,
          data: {}, // Empty data to trigger status transition
        });
      }
      toast.success("Đã gửi checklist cho cố vấn dịch vụ");
    } catch (error) {
      console.error("Submit checklist failed", error);
      toast.error("Không thể gửi checklist, vui lòng thử lại");
    } finally {
      setProcessingAction(null);
      setIsProcessing(false);
    }
  }, [intakeId, intake?.status, persistPendingResponses, updateIntake]);

  if (!intakeId) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
        <p>Không tìm thấy intake cần kiểm tra.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  if (isLoadingIntake || isLoadingChecklist) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!intake) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
        <p>Không tìm thấy phiếu tiếp nhận</p>
        <Button variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckSquare className="h-5 w-5 text-primary" />
              Checklist kỹ thuật viên
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Intake ID: {intake.id} • {intake.customerName ?? "Khách vãng lai"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              disabled={pendingResponses.size === 0 || isBusy}
              onClick={handleSaveDraft}
            >
              {processingAction === "save" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu nháp"
              )}
            </Button>
            <Button disabled={isBusy} onClick={handleSubmitChecklist}>
              {processingAction === "submit" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Hoàn tất checklist"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChecklistTable
            checklistGroups={checklistGroups}
            responses={responses}
            onResponseChangeAction={handleResponseChange}
            readOnly={false}
          />
          {pendingResponses.size > 0 && (
            <p className="text-xs text-muted-foreground">
              Có {pendingResponses.size} mục đã thay đổi nhưng chưa gửi.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
