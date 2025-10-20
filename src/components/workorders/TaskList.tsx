/**
 * Task List Component
 * For viewing and managing work order tasks
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    Circle,
    Loader2,
    Trash2,
    Edit,
    Save,
    X,
    Plus,
} from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    formatDuration,
    getTaskStatusColor,
} from '@/entities/workorder.types';
import type { WorkOrderTask, TaskStatus } from '@/entities/workorder.types';

interface TaskListProps {
    tasks: WorkOrderTask[];
    onUpdateTask?: (_taskId: string, _data: Partial<WorkOrderTask>) => Promise<void>;
    onDeleteTask?: (_taskId: string) => Promise<void>;
    onAddTask?: (_data: Omit<WorkOrderTask, 'id' | 'workOrderId' | 'completedAt'>) => Promise<void>;
    isLoading?: boolean;
    readOnly?: boolean;
    workOrderId?: string;
}

export function TaskList({
    tasks,
    onUpdateTask,
    onDeleteTask,
    onAddTask,
    isLoading = false,
    readOnly = false,
}: TaskListProps) {
    const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
    const [showAddForm, setShowAddForm] = React.useState(false);

    const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Tasks</h3>
                    <p className="text-sm text-muted-foreground">
                        {tasks.filter((t) => t.status === 'Done').length} of {tasks.length}{' '}
                        completed
                    </p>
                </div>
                {!readOnly && onAddTask && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddForm(true)}
                        disabled={isLoading}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {showAddForm && onAddTask && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <TaskAddForm
                            onSubmit={async (data) => {
                                await onAddTask(data);
                                setShowAddForm(false);
                            }}
                            onCancel={() => setShowAddForm(false)}
                            isLoading={isLoading}
                            order={tasks.length}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-3">
                {sortedTasks.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                No tasks added yet. Add a task to get started.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    sortedTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            isEditing={editingTaskId === task.id}
                            onEdit={() => setEditingTaskId(task.id)}
                            onCancelEdit={() => setEditingTaskId(null)}
                            onUpdate={async (data) => {
                                await onUpdateTask?.(task.id, data);
                                setEditingTaskId(null);
                            }}
                            onDelete={() => onDeleteTask?.(task.id)}
                            isLoading={isLoading}
                            readOnly={readOnly}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

interface TaskItemProps {
    task: WorkOrderTask;
    isEditing: boolean;
    onEdit: () => void;
    onCancelEdit: () => void;
    onUpdate: (_data: Partial<WorkOrderTask>) => Promise<void>;
    onDelete: () => void;
    isLoading: boolean;
    readOnly: boolean;
}

function TaskItem({
    task,
    isEditing,
    onEdit,
    onCancelEdit,
    onUpdate,
    onDelete,
    isLoading,
    readOnly,
}: TaskItemProps) {
    const [formData, setFormData] = React.useState(task);

    const handleSave = async () => {
        await onUpdate(formData);
    };

    const handleStatusToggle = async () => {
        const newStatus: TaskStatus =
            task.status === 'Done'
                ? 'NotStarted'
                : task.status === 'InProgress'
                    ? 'Done'
                    : 'InProgress';
        await onUpdate({ status: newStatus });
    };

    if (isEditing) {
        return (
            <Card className="border-primary">
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={2}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, status: value as TaskStatus })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NotStarted">Not Started</SelectItem>
                                    <SelectItem value="InProgress">In Progress</SelectItem>
                                    <SelectItem value="Done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Estimated Time (min)</Label>
                            <Input
                                type="number"
                                value={formData.estimatedMinutes || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        estimatedMinutes: e.target.value
                                            ? parseInt(e.target.value)
                                            : undefined,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onCancelEdit}
                            disabled={isLoading}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
        >
            <Card
                className={cn('transition-colors', {
                    'bg-accent/50': task.status === 'Done',
                })}
            >
                <CardContent className="flex items-start gap-4 py-4">
                    {/* Status Icon */}
                    {!readOnly && (
                        <button
                            onClick={handleStatusToggle}
                            className="mt-1 transition-transform hover:scale-110"
                            disabled={isLoading}
                        >
                            {task.status === 'Done' ? (
                                <Check className="h-5 w-5 text-green-600" />
                            ) : task.status === 'InProgress' ? (
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                        </button>
                    )}

                    {/* Task Info */}
                    <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                            <h4
                                className={cn('font-medium', {
                                    'line-through text-muted-foreground': task.status === 'Done',
                                })}
                            >
                                {task.title}
                            </h4>
                            <Badge className={getTaskStatusColor(task.status)}>
                                {task.status === 'NotStarted'
                                    ? 'Not Started'
                                    : task.status === 'InProgress'
                                        ? 'In Progress'
                                        : 'Done'}
                            </Badge>
                        </div>
                        {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {task.estimatedMinutes && (
                                <span>Est: {formatDuration(task.estimatedMinutes)}</span>
                            )}
                            {task.actualMinutes && (
                                <span>Actual: {formatDuration(task.actualMinutes)}</span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    {!readOnly && (
                        <div className="flex gap-1">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={onEdit}
                                disabled={isLoading}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={onDelete}
                                disabled={isLoading}
                                className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

interface TaskAddFormProps {
    onSubmit: (_data: Omit<WorkOrderTask, 'id' | 'workOrderId' | 'completedAt'>) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    order: number;
}

function TaskAddForm({ onSubmit, onCancel, isLoading, order }: TaskAddFormProps) {
    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        estimatedMinutes: undefined as number | undefined,
        status: 'NotStarted' as TaskStatus,
        order,
        actualMinutes: undefined,
        technicianNote: undefined,
    });

    const handleSubmit = async () => {
        await onSubmit(formData);
    };

    return (
        <Card className="border-primary">
            <CardHeader>
                <CardTitle className="text-base">Add New Task</CardTitle>
                <CardDescription>Create a new task for this work order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Task name"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Task details..."
                        rows={2}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Estimated Time (minutes)</Label>
                    <Input
                        type="number"
                        value={formData.estimatedMinutes || ''}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                estimatedMinutes: e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined,
                            })
                        }
                        placeholder="e.g., 60"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isLoading || !formData.title}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Task
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
