/**
 * Work Order Form Component
 * For creating new work orders linked to Service Intake
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { CreateWorkOrderRequest } from '@/entities/workorder.types';

interface WorkOrderFormProps {
    intakes?: Array<{
        id: string;
        bookingId: string;
        vehicleInfo?: string;
        customerName?: string;
    }>;
    technicians?: Array<{
        id: string;
        name: string;
        specialization?: string;
    }>;
    onSubmitAction: (_data: CreateWorkOrderRequest) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    defaultIntakeId?: string;
    defaultTechnicianId?: string;
}

interface TaskInput {
    title: string;
    description?: string;
    estimatedMinutes?: number;
    order: number;
}

export function WorkOrderForm({
    intakes = [],
    technicians = [],
    onSubmitAction,
    onCancel,
    isLoading = false,
    defaultIntakeId,
    defaultTechnicianId,
}: WorkOrderFormProps) {
    const [tasks, setTasks] = React.useState<TaskInput[]>([]);
    const [selectedIntakeId, setSelectedIntakeId] = React.useState<string>(
        defaultIntakeId || ''
    );
    const [selectedTechnicianId, setSelectedTechnicianId] = React.useState<string>(
        defaultTechnicianId || ''
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<{
        intakeId: string;
        technicianId: string;
        serviceType: string;
        notes?: string;
    }>({
        defaultValues: {
            intakeId: defaultIntakeId || '',
            technicianId: defaultTechnicianId || '',
            serviceType: '',
            notes: '',
        },
    });

    const handleFormSubmit = async (data: {
        intakeId: string;
        technicianId: string;
        serviceType: string;
        notes?: string;
    }) => {
        await onSubmitAction({
            ...data,
            tasks: tasks.length > 0 ? tasks.map(t => ({
                ...t,
                status: 'NotStarted' as const,
                actualMinutes: undefined,
                technicianNote: undefined,
                completedAt: undefined,
            })) : undefined,
        });
    };

    const addTask = () => {
        setTasks([
            ...tasks,
            {
                title: '',
                description: '',
                estimatedMinutes: undefined,
                order: tasks.length,
            },
        ]);
    };

    const updateTask = (index: number, field: keyof TaskInput, value: string | number | undefined) => {
        const updatedTasks = [...tasks];
        updatedTasks[index] = { ...updatedTasks[index], [field]: value };
        setTasks(updatedTasks);
    };

    const removeTask = (index: number) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        // Re-order remaining tasks
        const reorderedTasks = updatedTasks.map((task, i) => ({
            ...task,
            order: i,
        }));
        setTasks(reorderedTasks);
    };

    React.useEffect(() => {
        setValue('intakeId', selectedIntakeId);
    }, [selectedIntakeId, setValue]);

    React.useEffect(() => {
        setValue('technicianId', selectedTechnicianId);
    }, [selectedTechnicianId, setValue]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Create Work Order</CardTitle>
                <CardDescription>
                    Create a new work order and assign it to a technician
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Service Intake Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="intakeId">
                            Service Intake <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={selectedIntakeId}
                            onValueChange={setSelectedIntakeId}
                            disabled={isLoading || !!defaultIntakeId}
                        >
                            <SelectTrigger id="intakeId">
                                <SelectValue placeholder="Select service intake" />
                            </SelectTrigger>
                            <SelectContent>
                                {intakes.map((intake) => (
                                    <SelectItem key={intake.id} value={intake.id}>
                                        {intake.vehicleInfo || intake.bookingId} -{' '}
                                        {intake.customerName || 'Unknown Customer'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.intakeId && (
                            <p className="text-sm text-red-500">{errors.intakeId.message}</p>
                        )}
                    </div>

                    {/* Technician Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="technicianId">
                            Assign Technician <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={selectedTechnicianId}
                            onValueChange={setSelectedTechnicianId}
                            disabled={isLoading || !!defaultTechnicianId}
                        >
                            <SelectTrigger id="technicianId">
                                <SelectValue placeholder="Select technician" />
                            </SelectTrigger>
                            <SelectContent>
                                {technicians.map((tech) => (
                                    <SelectItem key={tech.id} value={tech.id}>
                                        {tech.name}
                                        {tech.specialization && (
                                            <span className="text-muted-foreground">
                                                {' '}
                                                - {tech.specialization}
                                            </span>
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.technicianId && (
                            <p className="text-sm text-red-500">{errors.technicianId.message}</p>
                        )}
                    </div>

                    {/* Service Type */}
                    <div className="space-y-2">
                        <Label htmlFor="serviceType">
                            Service Type <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="serviceType"
                            placeholder="e.g., Battery Replacement, Brake Inspection"
                            {...register('serviceType')}
                            disabled={isLoading}
                        />
                        {errors.serviceType && (
                            <p className="text-sm text-red-500">{errors.serviceType.message}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any special instructions or notes..."
                            rows={3}
                            {...register('notes')}
                            disabled={isLoading}
                        />
                    </div>

                    <Separator />

                    {/* Tasks Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Tasks</h3>
                                <p className="text-sm text-muted-foreground">
                                    Add tasks for this work order (optional)
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTask}
                                disabled={isLoading}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Task
                            </Button>
                        </div>

                        {tasks.length > 0 && (
                            <div className="space-y-3">
                                {tasks.map((task, index) => (
                                    <Card key={index} className="p-4">
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 space-y-3">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`task-title-${index}`}>
                                                            Task Title <span className="text-red-500">*</span>
                                                        </Label>
                                                        <Input
                                                            id={`task-title-${index}`}
                                                            placeholder="e.g., Replace battery cells"
                                                            value={task.title}
                                                            onChange={(e) =>
                                                                updateTask(index, 'title', e.target.value)
                                                            }
                                                            disabled={isLoading}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`task-description-${index}`}>
                                                            Description
                                                        </Label>
                                                        <Textarea
                                                            id={`task-description-${index}`}
                                                            placeholder="Task details..."
                                                            rows={2}
                                                            value={task.description}
                                                            onChange={(e) =>
                                                                updateTask(index, 'description', e.target.value)
                                                            }
                                                            disabled={isLoading}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor={`task-time-${index}`}>
                                                            Estimated Time (minutes)
                                                        </Label>
                                                        <Input
                                                            id={`task-time-${index}`}
                                                            type="number"
                                                            min="0"
                                                            placeholder="e.g., 60"
                                                            value={task.estimatedMinutes || ''}
                                                            onChange={(e) =>
                                                                updateTask(
                                                                    index,
                                                                    'estimatedMinutes',
                                                                    e.target.value ? parseInt(e.target.value) : undefined
                                                                )
                                                            }
                                                            disabled={isLoading}
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeTask(index)}
                                                    disabled={isLoading}
                                                    className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Work Order
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
