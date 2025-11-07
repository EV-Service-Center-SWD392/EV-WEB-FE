"use client";

import * as React from "react";
import { toast } from "sonner";
import { Calendar, UserCheck, Users, Search, RefreshCw, Clock4, Wrench } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { bookingService } from "@/services/bookingService";
import { staffDirectoryService } from "@/services/staffDirectoryService";
import { assignmentService } from "@/services/assignmentService";
import type { Booking } from "@/entities/booking.types";
import { BookingStatus } from "@/entities/booking.types";
import type { Center, Technician } from "@/entities/slot.types";
import { AssignmentQuickForm } from "@/components/staff/scheduling/molecules/AssignmentQuickForm";

const queueStatuses: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.ASSIGNED, BookingStatus.IN_QUEUE];

const statusBadgeMap: Record<BookingStatus, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
  [BookingStatus.PENDING]: { label: "Chờ xác nhận", variant: "outline" },
  [BookingStatus.ASSIGNED]: { label: "Đã phân công KTV", variant: "secondary" },
  [BookingStatus.IN_QUEUE]: { label: "Trong hàng chờ", variant: "outline" },
  [BookingStatus.ACTIVE]: { label: "Đang chuẩn bị", variant: "default" },
  [BookingStatus.CONFIRMED]: { label: "Đã xác nhận", variant: "secondary" },
  [BookingStatus.IN_PROGRESS]: { label: "Đang thực hiện", variant: "default" },
  [BookingStatus.COMPLETED]: { label: "Hoàn thành", variant: "secondary" },
  [BookingStatus.REASSIGNED]: { label: "Đã phân công lại", variant: "outline" },
  [BookingStatus.CANCELLED]: { label: "Đã hủy", variant: "destructive" },
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toIsoString = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Thời gian không hợp lệ");
  }
  return date.toISOString();
};

type TechnicianFilters = {
  shift: "all" | "Morning" | "Afternoon" | "Evening";
  workload: "all" | "Light" | "Balanced" | "Heavy";
  specialty: "all" | string;
};

export function StaffBookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [centers, setCenters] = React.useState<Center[]>([]);
  const [centerFilter, setCenterFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [assignTarget, setAssignTarget] = React.useState<Booking | null>(null);
  const [technicians, setTechnicians] = React.useState<Technician[]>([]);
  const [techFilters, setTechFilters] = React.useState<TechnicianFilters>({
    shift: "all",
    workload: "all",
    specialty: "all",
  });
  const [isAssignLoading, setIsAssignLoading] = React.useState(false);
  const [rescheduleTarget, setRescheduleTarget] = React.useState<Booking | null>(null);
  const [rescheduleTime, setRescheduleTime] = React.useState("");
  const [isRescheduling, setIsRescheduling] = React.useState(false);

  const loadCenters = React.useCallback(async () => {
    try {
      const centerData = await staffDirectoryService.getCenters();
      setCenters(centerData);
    } catch (error) {
      console.error("Failed to load centers", error);
      toast.error("Không thể tải danh sách trung tâm");
    }
  }, []);

  const loadBookings = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await bookingService.getClientBookings({});
      const filtered = data.filter((booking) =>
        queueStatuses.includes(booking.status as BookingStatus)
      );
      setBookings(filtered);
    } catch (error) {
      console.error("Failed to load bookings", error);
      toast.error("Không thể tải danh sách lịch hẹn");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadCenters();
    void loadBookings();
  }, [loadCenters, loadBookings]);

  const filteredTechnicians = React.useMemo(() => {
    return technicians.filter((tech) => {
      if (!tech.isActive) return false;
      if (techFilters.shift !== "all" && tech.shift !== techFilters.shift) return false;
      if (techFilters.workload !== "all" && tech.workload !== techFilters.workload) return false;
      if (techFilters.specialty !== "all" && !tech.specialties?.includes(techFilters.specialty)) return false;
      return true;
    });
  }, [technicians, techFilters]);

  const filteredBookings = React.useMemo(() => {
    return bookings
      .filter((booking) => {
        if (centerFilter !== "all" && booking.serviceCenterId !== centerFilter) return false;
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          booking.customerName.toLowerCase().includes(query) ||
          booking.customerPhone.toLowerCase().includes(query) ||
          (booking.bookingCode ?? booking.id).toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const statusDelta =
          queueStatuses.indexOf(a.status as BookingStatus) -
          queueStatuses.indexOf(b.status as BookingStatus);
        if (statusDelta !== 0) return statusDelta;
        return (
          new Date(a.preferredTime ?? a.scheduledDate ?? a.createdAt ?? new Date()).getTime() -
          new Date(b.preferredTime ?? b.scheduledDate ?? b.createdAt ?? new Date()).getTime()
        );
      });
  }, [bookings, centerFilter, searchQuery]);

  const openAssignModal = async (booking: Booking) => {
    setAssignTarget(booking);
    if (!booking.serviceCenterId) {
      toast.error("Booking chưa có trung tâm dịch vụ.");
      return;
    }
    try {
      const techData = await staffDirectoryService.getTechnicians(booking.serviceCenterId);
      setTechnicians(techData);
    } catch (error) {
      console.error("Failed to load technicians", error);
      toast.error("Không thể tải danh sách kỹ thuật viên");
    }
  };

  const handleAssignTechnician = async (dto: { technicianId: string }) => {
    if (!assignTarget?.serviceCenterId) {
      toast.error("Không xác định được trung tâm dịch vụ.");
      return;
    }
    setIsAssignLoading(true);
    try {
      await assignmentService.create({
        bookingId: assignTarget.id,
        centerId: assignTarget.serviceCenterId,
        technicianId: dto.technicianId,
      });

      await bookingService.updateBooking(assignTarget.id, {
        technicianId: dto.technicianId,
        assignmentStatus: BookingStatus.ASSIGNED,
      });
      toast.success("Đã phân công kỹ thuật viên");
      setAssignTarget(null);
      await loadBookings();
    } catch (error) {
      console.error("Assign technician failed", error);
      toast.error("Không thể phân công kỹ thuật viên");
    } finally {
      setIsAssignLoading(false);
    }
  };

  const openRescheduleModal = (booking: Booking) => {
    setRescheduleTarget(booking);
    setRescheduleTime(
      booking.preferredTime
        ? booking.preferredTime.slice(0, 16)
        : booking.scheduledDate?.slice(0, 16) ?? new Date().toISOString().slice(0, 16)
    );
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget) return;
    try {
      setIsRescheduling(true);
      const isoTime = toIsoString(rescheduleTime);
      await bookingService.updateBooking(rescheduleTarget.id, {
        scheduledDate: isoTime,
        status: BookingStatus.PENDING,
      });
      toast.success("Đã cập nhật thời gian lịch hẹn");
      setRescheduleTarget(null);
      await loadBookings();
    } catch (error) {
      console.error("Reschedule booking failed", error);
      toast.error("Không thể dời lịch hẹn");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleConfirmBooking = async (booking: Booking) => {
    try {
      await bookingService.updateBooking(booking.id, {
        status: BookingStatus.CONFIRMED,
        assignmentStatus: BookingStatus.IN_QUEUE,
      });
      toast.success("Đã xác nhận lịch hẹn");
      await loadBookings();
    } catch (error) {
      console.error("Confirm booking failed", error);
      toast.error("Không thể xác nhận lịch hẹn");
    }
  };

  const renderStatusBadges = (booking: Booking) => {
    // Use booking.status directly and handle both BookingStatus enum and string status
    const status = booking.status as BookingStatus;
    const bookingBadge = statusBadgeMap[status] ?? statusBadgeMap[BookingStatus.PENDING];
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={bookingBadge.variant}>{bookingBadge.label}</Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Hàng chờ lịch hẹn
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Phân công kỹ thuật viên trước khi khách hàng đến trung tâm.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadBookings()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Select value={centerFilter} onValueChange={setCenterFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc theo trung tâm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trung tâm</SelectItem>
                {centers.map((center) => (
                  <SelectItem key={center.id} value={center.id}>
                    {center.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm kiếm theo mã lịch hẹn, tên khách hoặc số điện thoại"
              className="pl-9"
            />
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-28 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border/60 bg-muted/40 py-12 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Không có lịch hẹn nào cần xử lý. Kiểm tra lại bộ lọc hoặc làm mới dữ liệu.
                </p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-xl border border-border/70 bg-card/95 p-5 shadow-sm transition-all hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{booking.bookingCode ?? booking.id}</Badge>
                        <span>{formatDateTime(booking.preferredTime)}</span>
                        <span>•</span>
                        <span>{booking.serviceCenterName ?? booking.serviceCenter ?? "Chưa chọn trung tâm"}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {booking.customerName}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {booking.customerPhone}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {booking.vehicleBrand} • {booking.vehicleType}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Wrench className="h-4 w-4" />
                          {booking.serviceType ?? "Chưa xác định"}
                        </span>
                      </div>
                      {booking.description && (
                        <p className="text-sm text-muted-foreground italic">
                          “{booking.description}”
                        </p>
                      )}
                    </div>
                    <div className="space-y-3 text-right">
                      {renderStatusBadges(booking)}
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openAssignModal(booking)}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Assign Technician
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRescheduleModal(booking)}
                        >
                          <Clock4 className="mr-2 h-4 w-4" />
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleConfirmBooking(booking)}
                          disabled={
                            (booking.status as BookingStatus) !== BookingStatus.ASSIGNED ||
                            booking.status === BookingStatus.CANCELLED
                          }
                        >
                          Confirm Appointment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!assignTarget} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Phân công kỹ thuật viên</DialogTitle>
          </DialogHeader>
          {assignTarget ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{assignTarget.customerName}</p>
                <p>
                  {assignTarget.serviceType ?? "Dịch vụ EV"} •{" "}
                  {formatDateTime(assignTarget.preferredTime ?? assignTarget.scheduledDate)}
                </p>
                <p>{assignTarget.vehicleBrand} • {assignTarget.vehicleType}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Select
                  value={techFilters.shift}
                  onValueChange={(value) =>
                    setTechFilters((prev) => ({ ...prev, shift: value as TechnicianFilters["shift"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ca làm việc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả ca</SelectItem>
                    <SelectItem value="Morning">Sáng</SelectItem>
                    <SelectItem value="Afternoon">Chiều</SelectItem>
                    <SelectItem value="Evening">Tối</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={techFilters.workload}
                  onValueChange={(value) =>
                    setTechFilters((prev) => ({ ...prev, workload: value as TechnicianFilters["workload"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tải công việc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả tải</SelectItem>
                    <SelectItem value="Light">Nhẹ</SelectItem>
                    <SelectItem value="Balanced">Vừa</SelectItem>
                    <SelectItem value="Heavy">Cao</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={techFilters.specialty}
                  onValueChange={(value) =>
                    setTechFilters((prev) => ({ ...prev, specialty: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chuyên môn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả chuyên môn</SelectItem>
                    {[...new Set(technicians.flatMap((tech) => tech.specialties ?? []))].map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <AssignmentQuickForm
                className="border border-dashed border-border/60 rounded-xl p-5"
                workItemId={assignTarget.id}
                workItemType="booking"
                technicians={filteredTechnicians}
                selectedDate={
                  assignTarget.preferredTime
                    ? assignTarget.preferredTime.slice(0, 10)
                    : assignTarget.scheduledDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
                }
                onSubmit={async (dto) => {
                  await handleAssignTechnician({ technicianId: dto.technicianId });
                }}
                onCancel={() => setAssignTarget(null)}
                isSubmitting={isAssignLoading}
                centerId={assignTarget.serviceCenterId ?? ""}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!rescheduleTarget} onOpenChange={(open) => !open && setRescheduleTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dời lịch hẹn</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Chọn thời gian mới cho lịch hẹn của khách hàng{" "}
              <span className="font-semibold text-foreground">
                {rescheduleTarget?.customerName}
              </span>
              .
            </p>
            <Input
              type="datetime-local"
              value={rescheduleTime}
              onChange={(event) => setRescheduleTime(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRescheduleTarget(null)} disabled={isRescheduling}>
                Hủy
              </Button>
              <Button onClick={handleReschedule} disabled={isRescheduling || !rescheduleTime}>
                {isRescheduling ? "Đang cập nhật..." : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
