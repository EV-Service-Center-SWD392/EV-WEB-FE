/**
 * Assignment Quick Form - Molecule Component
 * Form gán nhanh công việc cho technician
 */

import * as React from 'react';
import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Technician } from '@/entities/slot.types';
import type { CreateAssignmentDTO } from '@/entities/assignment.types';

import { ATechSelect } from '../atoms/ATechSelect';

export interface AssignmentQuickFormProps {
    workItemId: string;
    workItemType: 'booking' | 'serviceRequest';
    technicians: Technician[];
    selectedDate: string;
    onSubmit: (_dto: CreateAssignmentDTO) => void;
    onCancel?: () => void;
    isSubmitting?: boolean;
    centerId: string;
    className?: string;
}

export const AssignmentQuickForm: React.FC<AssignmentQuickFormProps> = ({
    workItemId,
    workItemType,
    technicians,
    selectedDate,
    onSubmit,
    onCancel,
    isSubmitting = false,
    centerId,
    className,
}) => {
    const [selectedTechId, setSelectedTechId] = React.useState<string>('');
    const [notes, setNotes] = React.useState('');
    const [error, setError] = React.useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedTechId) {
            setError('Vui lòng chọn kỹ thuật viên');
            return;
        }

        const dto: CreateAssignmentDTO = {
            centerId,
            technicianId: selectedTechId,
            note: notes || undefined,
            ...(workItemType === 'booking'
                ? { bookingId: workItemId }
                : { serviceRequestId: workItemId }),
        };

        onSubmit(dto);
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b">
                    <h3 className="font-semibold text-foreground">Phân công kỹ thuật viên</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>

                {/* Technician Selection */}
                <div className="space-y-2">
                    <Label htmlFor="technician">
                        Kỹ thuật viên <span className="text-destructive">*</span>
                    </Label>
                    <ATechSelect
                        technicians={technicians}
                        value={selectedTechId}
                        onChange={setSelectedTechId}
                        placeholder="Chọn kỹ thuật viên..."
                    />
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>

                {/* Work Item Info */}
                <div className="p-3 bg-muted rounded-lg text-sm">
                    <p className="text-muted-foreground">
                        <span className="font-medium">Công việc:</span>{' '}
                        {workItemType === 'booking' ? 'Booking' : 'Service Request'}
                    </p>
                    <p className="text-muted-foreground mt-1">
                        <span className="font-medium">ID:</span> {workItemId}
                    </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                        placeholder="Ghi chú cho kỹ thuật viên (không bắt buộc)..."
                        rows={3}
                        className="resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            Hủy
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isSubmitting || !selectedTechId}
                        className="flex-1"
                    >
                        {isSubmitting ? 'Đang phân công...' : 'Phân công'}
                    </Button>
                </div>
            </div>
        </form>
    );
};
