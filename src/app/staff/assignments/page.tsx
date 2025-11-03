/**
 * Staff Assignment List Page
 * Shows bookings that are ASSIGNED but don't have intake yet
 * Staff can create Service Intake from here
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserIcon, CarIcon, ClockIcon, PlusIcon, RefreshCw, ClipboardList } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';

import { bookingService } from '@/services/bookingService';
import { createIntake, getIntakeByBooking } from '@/services/intakeService';
import { BookingStatus, type Booking } from '@/entities/booking.types';
import type { CreateIntakeRequest } from '@/entities/intake.types';

export default function StaffAssignmentsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(true);
    const [isError, setIsError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [assignments, setAssignments] = React.useState<Booking[]>([]);
    const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
    const [isCreatingIntake, setIsCreatingIntake] = React.useState(false);

    // Intake form state
    const [intakeForm, setIntakeForm] = React.useState<CreateIntakeRequest>({
        licensePlate: '',
        odometer: undefined,
        arrivalNotes: '',
    });

    // Load assigned bookings without intake
    const loadAssignments = React.useCallback(async () => {
        try {
            setIsLoading(true);
            setIsError(false);
            setErrorMessage('');

            const allBookings = await bookingService.getBookings({});

            // Filter bookings with ASSIGNED status and no intake
            const assignedBookings = allBookings.filter(
                (booking) =>
                    booking.assignmentStatus === BookingStatus.ASSIGNED ||
                    booking.status === BookingStatus.ASSIGNED
            );

            // ⚠️ TEMPORARY: Check intakes one by one until backend provides joined data
            // TODO: Replace with single API call when backend supports:
            // GET /api/assignments?includeBooking=true&includeIntake=true&hasIntake=false
            const bookingsWithoutIntake: Booking[] = [];

            for (const booking of assignedBookings) {
                try {
                    const existingIntake = await getIntakeByBooking(booking.id);
                    if (!existingIntake) {
                        bookingsWithoutIntake.push(booking);
                    }
                } catch {
                    // If intake doesn't exist (404), add to list
                    bookingsWithoutIntake.push(booking);
                }
            }

            setAssignments(bookingsWithoutIntake);
        } catch (error) {
            console.error('Failed to load assignments:', error);
            setIsError(true);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to load assignments');
            toast.error('Không thể tải danh sách phân công');
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadAssignments();
    }, [loadAssignments]);

    const handleOpenIntakeDialog = (booking: Booking) => {
        setSelectedBooking(booking);
        setIntakeForm({
            licensePlate: '',
            odometer: undefined,
            arrivalNotes: '',
        });
    };

    const handleCloseDialog = () => {
        setSelectedBooking(null);
        setIntakeForm({
            licensePlate: '',
            odometer: undefined,
            arrivalNotes: '',
        });
    };

    const handleCreateIntake = async () => {
        if (!selectedBooking) return;

        if (!intakeForm.licensePlate?.trim()) {
            toast.error('Vui lòng nhập biển số xe');
            return;
        }

        try {
            setIsCreatingIntake(true);

            // Create intake
            const intake = await createIntake(selectedBooking.id, intakeForm);

            toast.success('Đã tạo phiếu tiếp nhận thành công');

            // Navigate to intake detail to initialize checklist
            router.push(`/staff/intakes/${intake.id}`);
        } catch (error) {
            console.error('Failed to create intake:', error);
            toast.error('Không thể tạo phiếu tiếp nhận');
        } finally {
            setIsCreatingIntake(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Đang tải...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Danh sách phân công
                        </h1>
                    </div>
                </div>
                <EmptyState
                    variant="error"
                    icon={ClipboardList}
                    title="Không thể tải danh sách phân công"
                    description={errorMessage || 'Đã có lỗi xảy ra khi tải dữ liệu'}
                    action={
                        <Button onClick={loadAssignments} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Thử lại
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Danh sách phân công
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Các booking đã được phân công kỹ thuật viên, chờ khách hàng đến
                    </p>
                </div>
                <Button variant="outline" onClick={loadAssignments}>
                    Làm mới
                </Button>
            </div>

            {/* Assignments Table */}
            {assignments.length === 0 ? (
                <EmptyState
                    icon={ClipboardList}
                    title="Không có booking nào đang chờ tạo phiếu tiếp nhận"
                    description="Các booking đã được phân công kỹ thuật viên sẽ hiển thị ở đây"
                />
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã Booking</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                <TableHead>Xe</TableHead>
                                <TableHead>Kỹ thuật viên</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">
                                        {booking.id.slice(0, 8)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <div>{booking.customerName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {booking.customerPhone}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <CarIcon className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                {booking.vehicleBrand} {booking.vehicleType}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {booking.technicianName || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <ClockIcon className="w-4 h-4 text-muted-foreground" />
                                            <div className="text-sm">
                                                {formatDate(booking.scheduledDate)}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {booking.assignmentStatus || booking.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            onClick={() => handleOpenIntakeDialog(booking)}
                                        >
                                            <PlusIcon className="w-4 h-4 mr-1" />
                                            Tạo phiếu tiếp nhận
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Create Intake Dialog */}
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && handleCloseDialog()}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Tạo phiếu tiếp nhận dịch vụ</DialogTitle>
                        <DialogDescription>
                            Nhập thông tin xe và ghi chú khi khách hàng đến trung tâm
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBooking && (
                        <div className="space-y-4 py-4">
                            {/* Customer Info */}
                            <div className="rounded-lg border p-3 bg-muted/50">
                                <div className="text-sm font-medium mb-2">Thông tin khách hàng</div>
                                <div className="grid gap-1 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Tên:</span>{' '}
                                        {selectedBooking.customerName}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">SĐT:</span>{' '}
                                        {selectedBooking.customerPhone}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Xe:</span>{' '}
                                        {selectedBooking.vehicleBrand} {selectedBooking.vehicleType}
                                    </div>
                                </div>
                            </div>

                            {/* License Plate */}
                            <div className="space-y-2">
                                <Label htmlFor="licensePlate">
                                    Biển số xe <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="licensePlate"
                                    placeholder="VD: 51A-12345"
                                    value={intakeForm.licensePlate}
                                    onChange={(e) =>
                                        setIntakeForm((prev) => ({
                                            ...prev,
                                            licensePlate: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            {/* Odometer */}
                            <div className="space-y-2">
                                <Label htmlFor="odometer">Số km đã đi</Label>
                                <Input
                                    id="odometer"
                                    type="number"
                                    placeholder="VD: 15000"
                                    value={intakeForm.odometer || ''}
                                    onChange={(e) =>
                                        setIntakeForm((prev) => ({
                                            ...prev,
                                            odometer: e.target.value ? Number(e.target.value) : undefined,
                                        }))
                                    }
                                />
                            </div>

                            {/* Arrival Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="arrivalNotes">Ghi chú khi đến</Label>
                                <Textarea
                                    id="arrivalNotes"
                                    placeholder="VD: Khách báo xe cảnh báo pin, yêu cầu kiểm tra hệ thống phanh..."
                                    rows={3}
                                    value={intakeForm.arrivalNotes}
                                    onChange={(e) =>
                                        setIntakeForm((prev) => ({
                                            ...prev,
                                            arrivalNotes: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog} disabled={isCreatingIntake}>
                            Hủy
                        </Button>
                        <Button onClick={handleCreateIntake} disabled={isCreatingIntake}>
                            {isCreatingIntake ? 'Đang tạo...' : 'Tạo phiếu tiếp nhận'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
