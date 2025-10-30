/**
 * Conflict Notice - Organism Component
 * Dialog thông báo khi có xung đột lịch technician
 */

import * as React from 'react';
import { AlertTriangle, X } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Assignment } from '@/entities/assignment.types';

export interface ConflictNoticeProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    conflictingAssignment: Assignment | null;
    technicianName?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export const ConflictNotice: React.FC<ConflictNoticeProps> = ({
    open,
    onOpenChange,
    conflictingAssignment,
    technicianName,
    onConfirm,
    onCancel,
}) => {
    const handleClose = () => {
        onOpenChange(false);
        onCancel?.();
    };

    const handleConfirm = () => {
        onConfirm?.();
        onOpenChange(false);
    };

    if (!conflictingAssignment) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-destructive">
                                Xung đột lịch làm việc
                            </DialogTitle>
                            <DialogDescription>
                                Kỹ thuật viên đã có công việc được phân công
                            </DialogDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={handleClose}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {/* Conflict Details */}
                <div className="space-y-4 py-4">
                    {/* Technician Info */}
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-2">
                            Kỹ thuật viên
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                            {technicianName || conflictingAssignment.technicianId}
                        </p>
                    </div>

                    {/* Conflicting Assignment */}
                    <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="destructive" className="text-xs">
                                Đã có phân công
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {conflictingAssignment.status}
                            </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Công việc: </span>
                                <span className="font-medium text-foreground">
                                    {conflictingAssignment.bookingId
                                        ? `Booking ${conflictingAssignment.bookingId}`
                                        : `Request ${conflictingAssignment.serviceRequestId}`}
                                </span>
                            </div>

                            {conflictingAssignment.startUtc && (
                                <div>
                                    <span className="text-muted-foreground">Thời gian: </span>
                                    <span className="font-medium text-foreground">
                                        {new Date(conflictingAssignment.startUtc).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                            )}

                            {conflictingAssignment.note && (
                                <div>
                                    <span className="text-muted-foreground">Ghi chú: </span>
                                    <span className="text-foreground">
                                        {conflictingAssignment.note}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Warning Message */}
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                            Không nên phân công thêm công việc cho kỹ thuật viên này trong cùng khung giờ.
                            Vui lòng chọn kỹ thuật viên khác hoặc điều chỉnh thời gian.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Đóng
                    </Button>
                    {onConfirm && (
                        <Button variant="destructive" onClick={handleConfirm}>
                            Vẫn phân công
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
