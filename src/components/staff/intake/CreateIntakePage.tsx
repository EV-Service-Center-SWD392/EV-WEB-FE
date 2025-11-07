"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ClipboardList, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Booking, BookingStatus } from "@/entities/booking.types";
import { bookingService } from "@/services/bookingService";
import { createIntake, createWalkInIntake } from "@/services/intakeService";

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

const eligibleStatuses: BookingStatus[] = [BookingStatus.CONFIRMED, BookingStatus.IN_QUEUE, BookingStatus.ASSIGNED];

export default function CreateIntakePage() {
  const router = useRouter();
  const [createTab, setCreateTab] = React.useState<"booking" | "walkin">("booking");
  const [isCreating, setIsCreating] = React.useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = React.useState(true);
  const [bookingOptions, setBookingOptions] = React.useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = React.useState("");
  const [bookingNotes, setBookingNotes] = React.useState({
    licensePlate: "",
    odometer: "",
    arrivalNotes: "",
  });
  const [walkInForm, setWalkInForm] = React.useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    vehicleBrand: "",
    vehicleType: "",
    licensePlate: "",
    odometer: "",
    arrivalNotes: "",
    notes: "",
  });

  React.useEffect(() => {
    let isMounted = true;
    setIsLoadingBookings(true);
    bookingService
      .getClientBookings({})
      .then((data) => {
        if (!isMounted) return;
        const eligible = data.filter((booking) => {
          const status = booking.status as BookingStatus;
          return eligibleStatuses.includes(status);
        });
        setBookingOptions(eligible);
      })
      .catch((error) => {
        console.error("Failed to load bookings for intake creation", error);
        toast.error("Không thể tải danh sách booking được xác nhận");
      })
      .finally(() => {
        if (isMounted) setIsLoadingBookings(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForms = React.useCallback(() => {
    setSelectedBookingId("");
    setBookingNotes({ licensePlate: "", odometer: "", arrivalNotes: "" });
    setWalkInForm({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      vehicleBrand: "",
      vehicleType: "",
      licensePlate: "",
      odometer: "",
      arrivalNotes: "",
      notes: "",
    });
  }, []);

  const handleCreateFromBooking = React.useCallback(async () => {
    if (!selectedBookingId) {
      toast.error("Vui lòng chọn booking đã xác nhận");
      return;
    }

    setIsCreating(true);
    try {
      const normalizedOdometer = bookingNotes.odometer.trim().replace(/[^\d]/g, "");
      const payload = {
        licensePlate: bookingNotes.licensePlate.trim() || undefined,
        odometer: normalizedOdometer ? Number(normalizedOdometer) : undefined,
        arrivalNotes: bookingNotes.arrivalNotes.trim() || undefined,
      };

      const intake = await createIntake(selectedBookingId, payload);

      try {
        await bookingService.updateBooking(selectedBookingId, {
          assignmentStatus: BookingStatus.ACTIVE,
        });
      } catch (error) {
        console.warn("[intake] Failed to update booking status after intake creation", error);
      }

      toast.success("Đã tạo phiếu tiếp nhận từ booking");
      resetForms();
      router.push(`/staff/intake/${intake.id}`);
    } catch (error) {
      console.error("Create intake from booking failed", error);
      toast.error("Không thể tạo phiếu tiếp nhận từ booking");
    } finally {
      setIsCreating(false);
    }
  }, [bookingNotes, resetForms, router, selectedBookingId]);

  const handleCreateWalkIn = React.useCallback(async () => {
    if (!walkInForm.customerName.trim() || !walkInForm.customerPhone.trim()) {
      toast.error("Vui lòng nhập thông tin khách hàng");
      return;
    }
    if (!walkInForm.vehicleType.trim() || !walkInForm.vehicleBrand.trim()) {
      toast.error("Vui lòng nhập thông tin phương tiện");
      return;
    }
    if (!walkInForm.licensePlate.trim()) {
      toast.error("Vui lòng nhập biển số xe");
      return;
    }

    setIsCreating(true);
    try {
      const normalizedOdometer = walkInForm.odometer.trim().replace(/[^\d]/g, "");
      const intake = await createWalkInIntake({
        walkIn: true,
        customerName: walkInForm.customerName.trim(),
        customerPhone: walkInForm.customerPhone.trim(),
        customerEmail: walkInForm.customerEmail.trim() || undefined,
        vehicleBrand: walkInForm.vehicleBrand.trim(),
        vehicleType: walkInForm.vehicleType.trim(),
        licensePlate: walkInForm.licensePlate.trim(),
        odometer: normalizedOdometer ? Number(normalizedOdometer) : undefined,
        arrivalNotes: walkInForm.arrivalNotes.trim() || undefined,
        notes: walkInForm.notes.trim() || undefined,
      });

      toast.success("Đã tạo phiếu tiếp nhận khách vãng lai");
      resetForms();
      router.push(`/staff/intake/${intake.id}`);
    } catch (error) {
      console.error("Create walk-in intake failed", error);
      toast.error("Không thể tạo phiếu tiếp nhận khách vãng lai");
    } finally {
      setIsCreating(false);
    }
  }, [resetForms, router, walkInForm]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/staff/intake-list")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Tạo phiếu tiếp nhận</h1>
          <p className="text-sm text-muted-foreground">
            Khởi tạo intake từ booking đã xác nhận hoặc khách walk-in tại quầy.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border border-border/50 shadow-lg">
        <CardHeader className="bg-muted/40">
          <CardTitle className="text-xl font-semibold">Nguồn tiếp nhận</CardTitle>
          <CardDescription>Chọn luồng phù hợp để tạo phiếu tiếp nhận mới.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8 pt-6">
          <Tabs value={createTab} onValueChange={(value) => setCreateTab(value as "booking" | "walkin")}>
            <TabsList className="mb-6 grid w-full grid-cols-2 rounded-2xl bg-muted/60 p-1">
              <TabsTrigger
                value="booking"
                className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Từ booking đã xác nhận
              </TabsTrigger>
              <TabsTrigger
                value="walkin"
                className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Khách walk-in
              </TabsTrigger>
            </TabsList>

            <TabsContent value="booking" className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Chọn booking đang chờ tiếp nhận</label>
                {isLoadingBookings ? (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Đang tải danh sách booking...
                  </div>
                ) : bookingOptions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                    Không có booking nào ở trạng thái Assigned / Confirmed / In Queue.
                  </div>
                ) : (
                  <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
                    <SelectTrigger className="rounded-xl border border-border/60 bg-background px-4 py-3 text-left">
                      <SelectValue placeholder="Chọn khách hàng hoặc mã booking" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {bookingOptions.map((booking) => (
                        <SelectItem key={booking.id} value={booking.id}>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">
                              {booking.customerName} • {booking.vehicleBrand} {booking.vehicleType}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(booking.preferredTime ?? booking.scheduledDate)} •{" "}
                              {booking.serviceCenterName ?? booking.serviceCenter}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Biển số xe *</label>
                    <Input
                      value={bookingNotes.licensePlate}
                      onChange={(event) =>
                        setBookingNotes((prev) => ({ ...prev, licensePlate: event.target.value }))
                      }
                      placeholder="VD: 51A-12345"
                      className="rounded-xl border-border/60 bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Số km hiện tại</label>
                    <Input
                      value={bookingNotes.odometer}
                      onChange={(event) =>
                        setBookingNotes((prev) => ({ ...prev, odometer: event.target.value }))
                      }
                      placeholder="VD: 10.000"
                      className="rounded-xl border-border/60 bg-background"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-foreground">Ghi chú khi tiếp nhận</label>
                  <Textarea
                    value={bookingNotes.arrivalNotes}
                    onChange={(event) =>
                      setBookingNotes((prev) => ({ ...prev, arrivalNotes: event.target.value }))
                    }
                    placeholder="Ghi chú đặc biệt từ khách hàng..."
                    className="min-h-[90px] rounded-xl border-border/60"
                  />
                </div>
              </div>

              <Button
                className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
                onClick={handleCreateFromBooking}
                disabled={isCreating || !selectedBookingId}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo intake...
                  </>
                ) : (
                  <>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Tạo intake từ booking
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="walkin" className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tên khách hàng *</label>
                    <Input
                      value={walkInForm.customerName}
                      onChange={(event) =>
                        setWalkInForm((prev) => ({ ...prev, customerName: event.target.value }))
                      }
                      placeholder="Nguyễn Văn A"
                      className="rounded-xl border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Số điện thoại *</label>
                    <Input
                      value={walkInForm.customerPhone}
                      onChange={(event) =>
                        setWalkInForm((prev) => ({ ...prev, customerPhone: event.target.value }))
                      }
                      placeholder="0901 234 567"
                      className="rounded-xl border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      value={walkInForm.customerEmail}
                      onChange={(event) =>
                        setWalkInForm((prev) => ({ ...prev, customerEmail: event.target.value }))
                      }
                      placeholder="khachhang@email.com"
                      className="rounded-xl border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Loại xe *</label>
                    <Input
                      value={walkInForm.vehicleType}
                      onChange={(event) =>
                        setWalkInForm((prev) => ({ ...prev, vehicleType: event.target.value }))
                      }
                      placeholder="Ô tô điện, xe máy điện..."
                      className="rounded-xl border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Hãng xe *</label>
                    <Input
                      value={walkInForm.vehicleBrand}
                      onChange={(event) =>
                        setWalkInForm((prev) => ({ ...prev, vehicleBrand: event.target.value }))
                      }
                      placeholder="VinFast, Tesla..."
                      className="rounded-xl border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Biển số xe *</label>
                    <Input
                      value={walkInForm.licensePlate}
                      onChange={(event) =>
                        setWalkInForm((prev) => ({ ...prev, licensePlate: event.target.value }))
                      }
                      placeholder="VD: 51A-12345"
                      className="rounded-xl border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Số km hiện tại</label>
                    <Input
                      value={walkInForm.odometer}
                      onChange={(event) =>
                        setWalkInForm((prev) => ({ ...prev, odometer: event.target.value }))
                      }
                      placeholder="VD: 12.500"
                      className="rounded-xl border-border/60"
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Ghi chú tiếp nhận</label>
                    <Textarea
                      value={walkInForm.arrivalNotes}
                      onChange={(event) =>
                        setWalkInForm((prev) => ({ ...prev, arrivalNotes: event.target.value }))
                      }
                      placeholder="Tình trạng ban đầu, yêu cầu của khách..."
                      className="min-h-[90px] rounded-xl border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Ghi chú nội bộ</label>
                    <Textarea
                      value={walkInForm.notes}
                      onChange={(event) =>
                        setWalkInForm((prev) => ({ ...prev, notes: event.target.value }))
                      }
                      placeholder="Thông tin bổ sung cho kỹ thuật viên"
                      className="min-h-[90px] rounded-xl border-border/60"
                    />
                  </div>
                </div>
              </div>

              <Button
                className="h-12 w-full rounded-xl bg-[#ff6b1a] text-base font-semibold text-white shadow-lg transition hover:bg-[#ff812f]"
                onClick={handleCreateWalkIn}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo intake...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Tiếp nhận khách walk-in
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
