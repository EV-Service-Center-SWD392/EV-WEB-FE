/**
 * IntakeActionButtons Component
 * Handles state machine transitions with confirmation dialogs
 */

"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { ServiceIntake } from "@/entities/intake.types";
import { INTAKE_ACTIONS, type IntakeActionType } from "../types";
import {
    startInspecting,
    verifyIntake,
    finalizeIntake,
    cancelIntake,
} from "@/services/intakeService";

interface IntakeActionButtonsProps {
    intake: ServiceIntake;
    onSuccess?: (_updatedIntake: ServiceIntake) => void;
    onError?: (_error: Error) => void;
    className?: string;
}

export function IntakeActionButtons({
    intake,
    onSuccess,
    onError,
    className = "",
}: IntakeActionButtonsProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [pendingAction, setPendingAction] = React.useState<IntakeActionType | null>(null);

    const handleAction = async (actionType: IntakeActionType) => {
        const action = INTAKE_ACTIONS[actionType];

        if (!action.allowedFromStates.includes(intake.status)) {
            toast.error(`Không thể ${action.label.toLowerCase()} từ trạng thái hiện tại`);
            return;
        }

        if (action.requiresConfirmation) {
            setPendingAction(actionType);
            return;
        }

        await executeAction(actionType);
    };

    const executeAction = async (actionType: IntakeActionType) => {
        setIsLoading(true);
        try {
            let updatedIntake: ServiceIntake;

            switch (actionType) {
                case "start-inspecting":
                    updatedIntake = await startInspecting(intake.id);
                    toast.success("Đã bắt đầu kiểm tra xe");
                    break;
                case "verify":
                    updatedIntake = await verifyIntake(intake.id);
                    toast.success("Đã xác minh intake thành công");
                    break;
                case "finalize":
                    updatedIntake = await finalizeIntake(intake.id);
                    toast.success("Đã hoàn tất intake");
                    break;
                case "cancel":
                    updatedIntake = await cancelIntake(intake.id);
                    toast.success("Đã hủy intake");
                    break;
                default:
                    throw new Error(`Unknown action: ${actionType}`);
            }

            onSuccess?.(updatedIntake);
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Có lỗi xảy ra khi thực hiện thao tác");
            onError?.(err);
        } finally {
            setIsLoading(false);
            setPendingAction(null);
        }
    };

    const confirmAction = () => {
        if (pendingAction) {
            executeAction(pendingAction);
        }
    };

    const cancelAction = () => {
        setPendingAction(null);
    };

    const getAvailableActions = (): IntakeActionType[] => {
        return (Object.keys(INTAKE_ACTIONS) as IntakeActionType[]).filter((actionType) => {
            const action = INTAKE_ACTIONS[actionType];
            return action.allowedFromStates.includes(intake.status);
        });
    };

    const availableActions = getAvailableActions();

    if (availableActions.length === 0) {
        return null;
    }

    return (
        <>
            <div className={`flex items-center gap-2 ${className}`}>
                {availableActions.map((actionType) => {
                    const action = INTAKE_ACTIONS[actionType];
                    return (
                        <Button
                            key={actionType}
                            variant={action.variant}
                            onClick={() => handleAction(actionType)}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {action.label}
                        </Button>
                    );
                })}
            </div>

            <AlertDialog open={pendingAction !== null} onOpenChange={cancelAction}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận thao tác</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingAction && INTAKE_ACTIONS[pendingAction]?.confirmationMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelAction}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmAction} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xác nhận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
