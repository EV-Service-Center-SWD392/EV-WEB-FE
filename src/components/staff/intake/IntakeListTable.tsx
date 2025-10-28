/**
 * Intake List Table Component
 * Displays list of service intakes with filtering and actions
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, FileText, Calendar, User, Car, Battery, Gauge } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { IntakeStatus } from '@/entities/intake.types';

interface IntakeListItem {
    id: string;
    bookingId: string;
    customerName: string;
    vehicleInfo: string;
    scheduledDate: string;
    status: IntakeStatus;
    odometer?: number;
    batterySoC?: number;
    createdAt: string;
}

interface IntakeListTableProps {
    searchQuery: string;
    statusFilter: IntakeStatus | 'all';
}

// Mock data for demonstration
const mockIntakes: IntakeListItem[] = [
    {
        id: 'intake-001',
        bookingId: 'BK001',
        customerName: 'Nguyễn Văn A',
        vehicleInfo: 'VinFast VF8 - 51A-12345',
        scheduledDate: '2024-01-15T09:00:00Z',
        status: 'Draft',
        odometer: 15000,
        batterySoC: 85,
        createdAt: '2024-01-15T08:30:00Z',
    },
    {
        id: 'intake-002',
        bookingId: 'BK002',
        customerName: 'Trần Thị B',
        vehicleInfo: 'Tesla Model 3 - 30B-98765',
        scheduledDate: '2024-01-15T10:30:00Z',
        status: 'Completed',
        odometer: 28000,
        batterySoC: 72,
        createdAt: '2024-01-15T10:00:00Z',
    },
    {
        id: 'intake-003',
        bookingId: 'BK003',
        customerName: 'Lê Văn C',
        vehicleInfo: 'VinFast VF9 - 59C-45678',
        scheduledDate: '2024-01-15T14:00:00Z',
        status: 'Draft',
        odometer: 8500,
        batterySoC: 90,
        createdAt: '2024-01-15T13:30:00Z',
    },
    {
        id: 'intake-004',
        bookingId: 'BK004',
        customerName: 'Phạm Thị D',
        vehicleInfo: 'Hyundai Kona EV - 51D-11223',
        scheduledDate: '2024-01-15T15:30:00Z',
        status: 'Completed',
        odometer: 42000,
        batterySoC: 65,
        createdAt: '2024-01-15T15:00:00Z',
    },
    {
        id: 'intake-005',
        bookingId: 'BK005',
        customerName: 'Hoàng Văn E',
        vehicleInfo: 'VinFast VF e34 - 29E-55667',
        scheduledDate: '2024-01-16T09:00:00Z',
        status: 'Draft',
        createdAt: '2024-01-16T08:45:00Z',
    },
];

export function IntakeListTable({ searchQuery, statusFilter }: IntakeListTableProps) {
    const router = useRouter();

    // Filter intakes
    const filteredIntakes = React.useMemo(() => {
        return mockIntakes.filter((intake) => {
            // Status filter
            if (statusFilter !== 'all' && intake.status !== statusFilter) {
                return false;
            }

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    intake.bookingId.toLowerCase().includes(query) ||
                    intake.customerName.toLowerCase().includes(query) ||
                    intake.vehicleInfo.toLowerCase().includes(query)
                );
            }

            return true;
        });
    }, [searchQuery, statusFilter]);

    const getStatusBadge = (status: IntakeStatus) => {
        switch (status) {
            case 'Draft':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                        <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2 animate-pulse" />
                        Đang xử lý
                    </Badge>
                );
            case 'Completed':
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                        Đã hoàn thành
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getBatteryColor = (batterySoC?: number) => {
        if (!batterySoC) return 'text-muted-foreground';
        if (batterySoC >= 80) return 'text-green-600';
        if (batterySoC >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-4">
            {filteredIntakes.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                        Không tìm thấy phiếu tiếp nhận
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Thử thay đổi bộ lọc hoặc tìm kiếm khác
                    </p>
                </div>
            ) : (
                <>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">STT</TableHead>
                                    <TableHead className="font-semibold">Mã Booking</TableHead>
                                    <TableHead className="font-semibold">Khách hàng</TableHead>
                                    <TableHead className="font-semibold">Phương tiện</TableHead>
                                    <TableHead className="font-semibold">Ngày hẹn</TableHead>
                                    <TableHead className="font-semibold">Trạng thái</TableHead>
                                    <TableHead className="font-semibold">Odo (km)</TableHead>
                                    <TableHead className="font-semibold">Pin (%)</TableHead>
                                    <TableHead className="text-right font-semibold">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredIntakes.map((intake, index) => (
                                    <TableRow
                                        key={intake.id}
                                        className="transition-all duration-200 hover:bg-muted/50 cursor-pointer group"
                                        onClick={() => router.push(`/staff/intake/${intake.id}`)}
                                    >
                                        <TableCell className="font-medium text-gray-900">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/20">
                                                    <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <span className="font-mono text-sm">{intake.bookingId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded bg-gray-100 dark:bg-gray-800">
                                                    <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                                </div>
                                                <span className="font-medium">{intake.customerName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded bg-green-100 dark:bg-green-900/20">
                                                    <Car className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                </div>
                                                <span className="text-sm">{intake.vehicleInfo}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/20">
                                                    <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <span className="text-sm font-mono">
                                                    {format(new Date(intake.scheduledDate), 'dd/MM/yyyy HH:mm', {
                                                        locale: vi,
                                                    })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(intake.status)}</TableCell>
                                        <TableCell>
                                            {intake.odometer ? (
                                                <div className="flex items-center gap-1">
                                                    <Gauge className="w-3 h-3 text-muted-foreground" />
                                                    <span className="font-mono text-sm">
                                                        {intake.odometer.toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {intake.batterySoC !== undefined ? (
                                                <div className="flex items-center gap-1">
                                                    <Battery className={cn("w-3 h-3", getBatteryColor(intake.batterySoC))} />
                                                    <span className={cn("font-mono text-sm font-medium", getBatteryColor(intake.batterySoC))}>
                                                        {intake.batterySoC}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/staff/intake/${intake.id}`);
                                                }}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Xem chi tiết
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div>
                            Hiển thị {filteredIntakes.length} phiếu tiếp nhận
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            <span className="text-xs">Đang xử lý</span>
                            <div className="h-2 w-2 rounded-full bg-green-500 ml-2" />
                            <span className="text-xs">Đã hoàn thành</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
