"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Booking, BookingStatus } from "@/entities/booking.types";
import { bookingService } from "@/services/bookingService";
import { useAuthStore } from "@/stores/auth";
import { CustomerBookingForm } from "@/components/booking/CustomerBookingForm";

type BadgeVariant = "default" | "outline" | "secondary" | "destructive";

type CustomerFacingStatus = BookingStatus.PENDING | BookingStatus.CONFIRMED | BookingStatus.CANCELLED;
type CustomerBooking = Booking & { customerStatus: CustomerFacingStatus };

const customerStatusLabels: Record<CustomerFacingStatus, { label: string; variant: BadgeVariant }> = {
  [BookingStatus.PENDING]: { label: "Chờ xác nhận", variant: "outline" },
  [BookingStatus.CONFIRMED]: { label: "Đã xác nhận", variant: "secondary" },
  [BookingStatus.CANCELLED]: { label: "Đã hủy", variant: "destructive" },
};

const customerStatusOrder: CustomerFacingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.CANCELLED,
];

function formatVietnamDate(isoDate?: string) {
  if (!isoDate) return "Chưa cập nhật";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function resolveCustomerStatus(booking: Booking): CustomerFacingStatus {
  if (booking.status === BookingStatus.CANCELLED) {
    return BookingStatus.CANCELLED;
  }

  // Check booking status directly since assignmentStatus doesn't exist
  if ([BookingStatus.CONFIRMED, BookingStatus.ASSIGNED, BookingStatus.IN_QUEUE, BookingStatus.ACTIVE].includes(booking.status as BookingStatus)) {
    return BookingStatus.CONFIRMED;
  }

  return BookingStatus.PENDING;
}

function getCustomerStatusBadge(status: CustomerFacingStatus, fallback: CustomerFacingStatus = BookingStatus.PENDING) {
  const config = customerStatusLabels[status] ?? customerStatusLabels[fallback];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default function MemberAppointmentsPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await bookingService.getClientBookings({});
      const filtered = user?.email
        ? data.filter((booking: Booking) => booking.customerEmail?.toLowerCase() === user.email.toLowerCase())
        : data;
      setBookings(filtered);
    } catch (error) {
      console.error("Failed to load member bookings", error);
      toast.error("Không tải được danh sách lịch hẹn");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const handleBookingSuccess = useCallback(() => {
    setIsBookingDialogOpen(false);
    void loadBookings();
  }, [loadBookings]);

  const normalizedBookings = useMemo<CustomerBooking[]>(() => {
    return bookings.map((booking) => ({
      ...booking,
      customerStatus: resolveCustomerStatus(booking),
    }));
  }, [bookings]);

  const upcomingBooking = useMemo(() => {
    return normalizedBookings
      .filter((booking) => booking.customerStatus !== BookingStatus.CANCELLED)
      .sort(
        (a, b) =>
          new Date(a.preferredTime ?? a.scheduledDate ?? a.createdAt ?? new Date()).getTime() -
          new Date(b.preferredTime ?? b.scheduledDate ?? b.createdAt ?? new Date()).getTime(),
      )[0];
  }, [normalizedBookings]);

  const sortedBookings = useMemo(() => {
    return [...normalizedBookings]
      .sort((a, b) => {
        const statusWeight =
          customerStatusOrder.indexOf(a.customerStatus) - customerStatusOrder.indexOf(b.customerStatus);
        if (statusWeight !== 0) return statusWeight;
        return new Date(b.scheduledDate ?? b.createdAt ?? new Date()).getTime() - new Date(a.scheduledDate ?? a.createdAt ?? new Date()).getTime();
      });
  }, [normalizedBookings]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lịch hẹn dịch vụ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi quá trình: Đặt lịch → Phân công kỹ thuật viên → Tiếp nhận → Kiểm tra → Sửa chữa → Hoàn tất.
          </p>
        </div>
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="md:self-end">
              <CalendarClock className="mr-2 h-4 w-4" />
              Đặt lịch mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
            <DialogHeader className="sr-only">
              <DialogTitle>Đặt lịch dịch vụ</DialogTitle>
              <DialogDescription>Điền thông tin xe và nhu cầu dịch vụ</DialogDescription>
            </DialogHeader>
            <CustomerBookingForm redirectTo={null} onSuccess={handleBookingSuccess} />
          </DialogContent>
        </Dialog>
      </header>

      {upcomingBooking && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Calendar className="h-5 w-5" />
              Lịch hẹn sắp tới
            </div>
            {getCustomerStatusBadge(upcomingBooking.customerStatus)}
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatVietnamDate(upcomingBooking.preferredTime ?? upcomingBooking.scheduledDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{upcomingBooking.serviceCenterName ?? upcomingBooking.serviceCenter ?? "Chưa xác định"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{upcomingBooking.serviceType ?? "Gói dịch vụ chưa cập nhật"}</span>
            </div>
            {upcomingBooking.technicianName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCheck className="h-4 w-4" />
                <span>Kỹ thuật viên dự kiến: {upcomingBooking.technicianName}</span>
              </div>
            )}
            {upcomingBooking.description && (
              <p className="text-sm text-muted-foreground md:col-span-2">
                Ghi chú: {upcomingBooking.description}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Lịch sử đặt lịch</CardTitle>
          <div className="text-sm text-muted-foreground">
            {isLoading ? "Đang tải..." : `${sortedBookings.length} lịch hẹn đã ghi nhận`}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : sortedBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/40 p-8 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Bạn chưa có lịch hẹn nào. Nhấn “Đặt lịch mới” để bắt đầu.
              </p>
              <Button variant="outline" onClick={() => setIsBookingDialogOpen(true)}>
                <CalendarClock className="mr-2 h-4 w-4" />
                Đặt lịch dịch vụ
              </Button>
            </div>
          ) : (
            sortedBookings.map((booking) => {
              const customerStatus = booking.customerStatus;

              return (
                <Card key={booking.id} className="border border-border/70 shadow-none">
                  <CardContent className="space-y-4 py-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {booking.serviceType ?? "Dịch vụ EV"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.vehicleBrand} • {booking.vehicleType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Mã lịch hẹn: {booking.bookingCode ?? booking.id}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {getCustomerStatusBadge(customerStatus)}
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatVietnamDate(booking.scheduledDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.serviceCenterName ?? booking.serviceCenter ?? "Chưa cập nhật"}</span>
                      </div>
                      {booking.technicianName && (
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <span>Kỹ thuật viên: {booking.technicianName}</span>
                        </div>
                      )}
                      {booking.estimatedCost && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>
                            Chi phí dự kiến:{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(booking.estimatedCost)}
                          </span>
                        </div>
                      )}
                    </div>

                    {booking.description && (
                      <p className="text-sm text-muted-foreground italic">“{booking.description}”</p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
