/**
 * Intake List Table Component
 * Displays service intakes filtered by status/search with live data
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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ServiceIntake, IntakeStatus } from '@/entities/intake.types';

interface IntakeListTableProps {
  intakes: ServiceIntake[];
  isLoading: boolean;
  searchQuery?: string;
  statusFilter?: IntakeStatus | 'all';
}

const statusConfigs: Record<IntakeStatus, { label: string; badgeClass: string }> = {
  Checked_In: {
    label: 'Đã check-in',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  Inspecting: {
    label: 'Đang kiểm tra',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  Verified: {
    label: 'Đã xác nhận',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  Finalized: {
    label: 'Hoàn tất',
    badgeClass: 'bg-green-100 text-green-800 border-green-200',
  },
  Cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
  },
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
};

const buildSearchString = (intake: ServiceIntake) =>
  [
    intake.bookingCode,
    intake.bookingId,
    intake.customerName,
    intake.customerPhone,
    intake.licensePlate,
    intake.serviceCenterName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const getVehicleInfo = (intake: ServiceIntake) => {
  const parts = [intake.vehicleBrand, intake.vehicleType, intake.licensePlate].filter(Boolean);
  return parts.length > 0 ? parts.join(' • ') : 'Chưa cập nhật';
};

const getBatteryColor = (batterySoC?: number) => {
  if (batterySoC === undefined || batterySoC === null) return 'text-muted-foreground';
  if (batterySoC >= 80) return 'text-green-600';
  if (batterySoC >= 50) return 'text-amber-600';
  return 'text-red-600';
};

const getSortTime = (intake: ServiceIntake) => {
  const source = intake.scheduledDate ?? intake.createdAt;
  if (!source) return Number.MAX_SAFE_INTEGER;
  const date = new Date(source);
  return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
};

export function IntakeListTable({
  intakes,
  isLoading,
  searchQuery,
  statusFilter,
}: IntakeListTableProps) {
  const router = useRouter();

  const filteredIntakes = React.useMemo(() => {
    const normalizedStatus = statusFilter && statusFilter !== 'all' ? statusFilter : undefined;
    const statusFiltered = normalizedStatus
      ? intakes.filter((intake) => intake.status === normalizedStatus)
      : intakes;

    const query = searchQuery?.trim().toLowerCase();
    const searchFiltered = query
      ? statusFiltered.filter((intake) => buildSearchString(intake).includes(query))
      : statusFiltered;

    return [...searchFiltered].sort((a, b) => getSortTime(a) - getSortTime(b));
  }, [intakes, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (filteredIntakes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/40 py-12 text-center">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {searchQuery
            ? `Không tìm thấy phiếu tiếp nhận khớp với “${searchQuery}”.`
            : 'Chưa có phiếu tiếp nhận nào ở trạng thái đã chọn.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
            {filteredIntakes.map((intake, index) => {
              const bookingDisplay = intake.bookingCode ?? intake.bookingId ?? 'Walk-in';
              const statusConfig = statusConfigs[intake.status];
              return (
                <TableRow
                  key={intake.id}
                  className="cursor-pointer transition-all duration-200 hover:bg-muted/50"
                  onClick={() => router.push(`/staff/intake/${intake.id}`)}
                >
                  <TableCell className="font-medium text-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="rounded bg-blue-100 p-1 dark:bg-blue-900/20">
                        <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-mono text-sm">{bookingDisplay}</span>
                      {intake.walkIn && (
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                          Walk-in
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="rounded bg-gray-100 p-1 dark:bg-gray-800">
                        <User className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="font-medium">
                        {intake.customerName ?? 'Khách vãng lai'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="rounded bg-green-100 p-1 dark:bg-green-900/20">
                        <Car className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm">{getVehicleInfo(intake)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="rounded bg-purple-100 p-1 dark:bg-purple-900/20">
                        <Calendar className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="font-mono text-sm">
                        {formatDateTime(intake.scheduledDate ?? intake.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {statusConfig ? (
                      <Badge variant="secondary" className={cn('border', statusConfig.badgeClass)}>
                        {statusConfig.label}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{intake.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {intake.odometer !== undefined && intake.odometer !== null ? (
                      <div className="flex items-center gap-1">
                        <Gauge className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {intake.odometer.toLocaleString('vi-VN')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {intake.batterySoC !== undefined && intake.batterySoC !== null ? (
                      <div className="flex items-center gap-1">
                        <Battery className={cn('h-3 w-3', getBatteryColor(intake.batterySoC))} />
                        <span className={cn('font-mono text-sm font-medium', getBatteryColor(intake.batterySoC))}>
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
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/staff/intake/${intake.id}`);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Hiển thị {filteredIntakes.length} phiếu tiếp nhận</div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-xs">Đang xử lý</span>
          <div className="ml-2 h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs">Hoàn tất</span>
        </div>
      </div>
    </div>
  );
}

