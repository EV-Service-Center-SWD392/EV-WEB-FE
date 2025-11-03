/**
 * Staff Work Order Detail Page
 * Detailed view with tabs for overview, tasks, photos, and progress
 */

'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Play,
    Pause,
    PackageOpen,
    ShieldCheck,
    CheckCircle,
    ImagePlus,
    FileText,
    ClipboardList,
    XCircle,
    Clock,
    RefreshCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WorkOrderProgressTracker } from '@/components/workorders/WorkOrderProgressTracker';
import { TaskList } from '@/components/workorders/TaskList';
import {
    useWorkOrderById,
    useUpdateWorkOrderStatus,
    useUpdateWorkOrderNotes,
    useWorkOrderTasks,
    useUpdateTask,
    useDeleteTask,
    useCreateTask,
    useWorkOrderPhotos,
    useUploadPhoto,
    useDeletePhoto,
} from '@/hooks/workorders/useWorkOrders';
import type { WorkOrderStatus } from '@/entities/workorder.types';
import { getWorkOrderStatusLabel } from '@/entities/workorder.types';
import { cn } from '@/lib/utils';

type StatusTone = 'info' | 'success' | 'warning' | 'danger';

const toneStyles: Record<StatusTone, string> = {
    info: 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/40 dark:bg-sky-900/30 dark:text-sky-100 [&>svg]:text-sky-500',
    success: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-100 [&>svg]:text-emerald-500',
    warning: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-900/30 dark:text-amber-100 [&>svg]:text-amber-400',
    danger: 'border-red-300 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-100 [&>svg]:text-red-500',
};

const statusGuidance: Record<
    WorkOrderStatus,
    { title: string; description: string; tone: StatusTone; icon: LucideIcon }
> = {
    Draft: {
        title: 'Draft in progress',
        description:
            'Collect the required tasks, estimated costs, and notes before submitting this work order for customer approval.',
        tone: 'info',
        icon: ClipboardList,
    },
    AwaitingApproval: {
        title: 'Waiting for customer decision',
        description:
            'The proposal has been sent. Capture the customer response and use Approve or Reject once they confirm, or resubmit if changes are required.',
        tone: 'warning',
        icon: Clock,
    },
    Approved: {
        title: 'Work order approved',
        description:
            'The customer agreed to the scope. Start work when a technician is ready using the Start Work action.',
        tone: 'success',
        icon: ShieldCheck,
    },
    InProgress: {
        title: 'Technician is working',
        description:
            'Monitor progress and use Pause, Waiting Parts, or Send to QA if the workflow needs to branch.',
        tone: 'info',
        icon: Play,
    },
    Paused: {
        title: 'Work is paused',
        description:
            'Resume the order when the blocker is cleared, or update notes with the reason for the pause.',
        tone: 'warning',
        icon: Pause,
    },
    WaitingParts: {
        title: 'Waiting for spare parts',
        description:
            'Parts are on order. Update the ETA in notes and resume work as soon as the parts arrive.',
        tone: 'warning',
        icon: PackageOpen,
    },
    QA: {
        title: 'Under QA review',
        description:
            'Quality assurance must sign off before the vehicle can be released. Capture any inspection findings.',
        tone: 'info',
        icon: ShieldCheck,
    },
    Revised: {
        title: 'Customer requested revisions',
        description:
            'Adjust the tasks, pricing, or notes per customer feedback, then resubmit the order for approval.',
        tone: 'info',
        icon: RefreshCcw,
    },
    Rejected: {
        title: 'Work order rejected',
        description:
            'The customer declined this proposal. Update the scope or close out the order after documenting the reason.',
        tone: 'danger',
        icon: XCircle,
    },
    Completed: {
        title: 'Order completed',
        description:
            'Confirm delivery paperwork and customer handoff steps are done before archiving this order.',
        tone: 'success',
        icon: CheckCircle,
    },
};

export default function StaffWorkOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const workOrderId = params.id as string;

    const [notes, setNotes] = React.useState('');
    const [isEditingNotes, setIsEditingNotes] = React.useState(false);

    // Fetch work order with polling
    const { data: workOrder, isLoading } = useWorkOrderById(workOrderId, 30000);
    const { data: tasks = [] } = useWorkOrderTasks(workOrderId);
    const { data: photos = [] } = useWorkOrderPhotos(workOrderId);

    // Mutations
    const updateStatusMutation = useUpdateWorkOrderStatus();
    const updateNotesMutation = useUpdateWorkOrderNotes();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();
    const createTaskMutation = useCreateTask();
    const uploadPhotoMutation = useUploadPhoto();
    const deletePhotoMutation = useDeletePhoto();

    React.useEffect(() => {
        if (workOrder?.notes) {
            setNotes(workOrder.notes);
        }
    }, [workOrder?.notes]);

    const handleStatusChange = async (status: WorkOrderStatus) => {
        if (!workOrder) return;
        await updateStatusMutation.mutateAsync({ id: workOrder.id, status });
    };

    const handleSaveNotes = async () => {
        if (!workOrder) return;
        await updateNotesMutation.mutateAsync({ id: workOrder.id, notes });
        setIsEditingNotes(false);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (const file of Array.from(files)) {
            await uploadPhotoMutation.mutateAsync({
                workOrderId,
                file,
                type: 'during',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <p className="text-muted-foreground">Loading work order...</p>
            </div>
        );
    }

    if (!workOrder) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Work order not found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const guidance = statusGuidance[workOrder.status];
    const GuidanceIcon = guidance.icon;

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Work Order #{workOrder.id.slice(0, 8)}
                        </h1>
                        <p className="text-muted-foreground">
                            {workOrder.vehicleInfo?.model || 'Unknown Vehicle'} •{' '}
                            {workOrder.serviceType}
                        </p>
                    </div>
                </div>

                {/* Status Actions */}
                <div className="flex gap-2">
                    {workOrder.status === 'Draft' && (
                        <Button onClick={() => handleStatusChange('AwaitingApproval')}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Submit for approval
                        </Button>
                    )}
                    {(workOrder.status === 'Revised' || workOrder.status === 'Rejected') && (
                        <Button onClick={() => handleStatusChange('AwaitingApproval')}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Resubmit for approval
                        </Button>
                    )}
                    {workOrder.status === 'AwaitingApproval' && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => handleStatusChange('Rejected')}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                            <Button onClick={() => handleStatusChange('Approved')}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                        </>
                    )}
                    {workOrder.status === 'Approved' && (
                        <Button onClick={() => handleStatusChange('InProgress')}>
                            <Play className="mr-2 h-4 w-4" />
                            Start Work
                        </Button>
                    )}
                    {workOrder.status === 'InProgress' && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => handleStatusChange('Paused')}
                            >
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleStatusChange('WaitingParts')}
                            >
                                <PackageOpen className="mr-2 h-4 w-4" />
                                Waiting Parts
                            </Button>
                            <Button onClick={() => handleStatusChange('QA')}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Send to QA
                            </Button>
                        </>
                    )}
                    {workOrder.status === 'Paused' && (
                        <Button onClick={() => handleStatusChange('InProgress')}>
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                        </Button>
                    )}
                    {workOrder.status === 'QA' && (
                        <Button onClick={() => handleStatusChange('Completed')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete
                        </Button>
                    )}
                </div>
            </div>

            <Alert className={cn('border-l-4 shadow-sm', toneStyles[guidance.tone])}>
                <GuidanceIcon className="h-4 w-4" />
                <AlertTitle>{guidance.title}</AlertTitle>
                <AlertDescription>{guidance.description}</AlertDescription>
            </Alert>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">
                        Tasks <Badge className="ml-2" variant="secondary">{tasks.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="photos">
                        Photos <Badge className="ml-2" variant="secondary">{photos.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Work Order Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Work Order Details</CardTitle>
                                <CardDescription>General information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <p className="font-medium">
                                        {getWorkOrderStatusLabel(workOrder.status)}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <Label className="text-muted-foreground">Service Type</Label>
                                    <p className="font-medium">{workOrder.serviceType}</p>
                                </div>
                                {workOrder.partsRequired && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-muted-foreground">Parts / Materials</Label>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {workOrder.partsRequired}
                                            </p>
                                        </div>
                                    </>
                                )}
                                {workOrder.estimatedCost !== undefined && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-muted-foreground">Estimated Cost</Label>
                                            <p className="font-medium">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }).format(workOrder.estimatedCost)}
                                            </p>
                                        </div>
                                    </>
                                )}
                                {workOrder.approvalNotes && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-muted-foreground">Approval Notes</Label>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {workOrder.approvalNotes}
                                            </p>
                                        </div>
                                    </>
                                )}
                                <Separator />
                                <div>
                                    <Label className="text-muted-foreground">Technician</Label>
                                    <p className="font-medium">
                                        {workOrder.technicianName || 'Unassigned'}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <Label className="text-muted-foreground">Created</Label>
                                    <p className="font-medium">
                                        {new Date(workOrder.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {workOrder.startedAt && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-muted-foreground">Started</Label>
                                            <p className="font-medium">
                                                {new Date(workOrder.startedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </>
                                )}
                                {workOrder.completedAt && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-muted-foreground">Completed</Label>
                                            <p className="font-medium">
                                                {new Date(workOrder.completedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Vehicle & Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Vehicle & Customer</CardTitle>
                                <CardDescription>Contact and vehicle details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {workOrder.vehicleInfo && (
                                    <>
                                        <div>
                                            <Label className="text-muted-foreground">Vehicle</Label>
                                            <p className="font-medium">
                                                {workOrder.vehicleInfo.brand} {workOrder.vehicleInfo.model}
                                            </p>
                                        </div>
                                        {workOrder.vehicleInfo.vin && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <Label className="text-muted-foreground">VIN</Label>
                                                    <p className="font-mono text-sm">
                                                        {workOrder.vehicleInfo.vin}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                                {workOrder.customerInfo && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-muted-foreground">Customer</Label>
                                            <p className="font-medium">{workOrder.customerInfo.name}</p>
                                        </div>
                                        {workOrder.customerInfo.phone && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <Label className="text-muted-foreground">Phone</Label>
                                                    <p className="font-medium">
                                                        {workOrder.customerInfo.phone}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                        {workOrder.customerInfo.email && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <Label className="text-muted-foreground">Email</Label>
                                                    <p className="font-medium">
                                                        {workOrder.customerInfo.email}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Notes
                                    </CardTitle>
                                    <CardDescription>Work order notes and comments</CardDescription>
                                </div>
                                {!isEditingNotes && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditingNotes(true)}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isEditingNotes ? (
                                <div className="space-y-4">
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={5}
                                        placeholder="Add notes..."
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setNotes(workOrder.notes || '');
                                                setIsEditingNotes(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button size="sm" onClick={handleSaveNotes}>
                                            Save Notes
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {workOrder.notes || 'No notes added yet.'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks">
                    <TaskList
                        tasks={tasks}
                        workOrderId={workOrderId}
                        onUpdateTask={async (taskId, data) => {
                            await updateTaskMutation.mutateAsync({ taskId, data });
                        }}
                        onDeleteTask={async (taskId) => {
                            await deleteTaskMutation.mutateAsync({ taskId, workOrderId });
                        }}
                        onAddTask={async (data) => {
                            await createTaskMutation.mutateAsync({
                                workOrderId,
                                data,
                            });
                        }}
                    />
                </TabsContent>

                {/* Photos Tab */}
                <TabsContent value="photos" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Work Order Photos</h3>
                            <p className="text-sm text-muted-foreground">
                                {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
                            </p>
                        </div>
                        <div>
                            <input
                                type="file"
                                id="photo-upload"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoUpload}
                            />
                            <Button
                                size="sm"
                                onClick={() => document.getElementById('photo-upload')?.click()}
                            >
                                <ImagePlus className="mr-2 h-4 w-4" />
                                Upload Photos
                            </Button>
                        </div>
                    </div>

                    {photos.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="py-12 text-center">
                                <ImagePlus className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    No photos uploaded yet. Click the button above to add photos.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {photos.map((photo) => (
                                <Card key={photo.id} className="overflow-hidden">
                                    <img
                                        src={photo.url}
                                        alt={photo.name}
                                        className="aspect-video w-full object-cover"
                                    />
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{photo.name}</p>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    deletePhotoMutation.mutate({
                                                        photoId: photo.id,
                                                        workOrderId,
                                                    })
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Progress Tab */}
                <TabsContent value="progress">
                    <Card>
                        <CardHeader>
                            <CardTitle>Work Order Progress</CardTitle>
                            <CardDescription>Track status and completion</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <WorkOrderProgressTracker workOrder={workOrder} showTimestamps />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
