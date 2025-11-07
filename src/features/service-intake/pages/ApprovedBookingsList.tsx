/**
 * ApprovedBookingsList Page
 * List of approved bookings pending intake creation
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RefreshCw, Search, Plus, Calendar, User, Car, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { directBookingService } from "@/services/directBookingService";
import { listIntakes } from "@/services/intakeService";
import { CreateIntakeDialog } from "../components/CreateIntakeDialog";
import type { ServiceIntake } from "@/entities/intake.types";
import type { BookingScheduleSlot } from "@/services/bookingScheduleService";

interface BookingFromSupabase {
    bookingid: string;
    customerid: string;
    vehicleid: string;
    status: string;
    bookingdate: string | null;
    notes: string | null;
    slotid?: string | null; // Added slot ID
    useraccount?: {
        email?: string;
        phonenumber?: string;
        firstname?: string;
        lastname?: string;
    };
    vehicle?: {
        licenseplate?: string;
        year?: number;
        vehiclemodel?: {
            name?: string;
            brand?: string;
        };
    };
}

interface BookingWithIntakeStatus extends BookingFromSupabase {
    hasIntake: boolean;
    slotInfo?: BookingScheduleSlot; // Added slot info
}

const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("vi-VN");
};

export default function ApprovedBookingsList() {
    const router = useRouter();
    const [bookings, setBookings] = React.useState<BookingWithIntakeStatus[]>([]);
    const [filteredBookings, setFilteredBookings] = React.useState<BookingWithIntakeStatus[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Dialog state
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedBooking, setSelectedBooking] = React.useState<BookingFromSupabase | null>(null);

    const loadData = React.useCallback(async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            // Load approved bookings with slot info using enhanced service
            const bookingsData = await directBookingService.getApprovedBookingsWithSlots();

            // Load existing intakes to check which bookings already have intakes
            let intakeBookingIds = new Set<string>();
            try {
                // Don't pass "all" as status - just omit it to get all intakes
                const intakes = await listIntakes({});
                intakeBookingIds = new Set(
                    intakes.map((intake) => intake.bookingId).filter((id): id is string => Boolean(id))
                );
            } catch (intakeError) {
                console.warn("Could not load intakes (API may not be available):", intakeError);
            }

            // Map bookings with intake status and slot info
            const mappedBookings = (bookingsData || []).map((booking): BookingWithIntakeStatus => ({
                bookingid: booking.id,
                customerid: booking.customerId,
                vehicleid: booking.vehicleId,
                status: booking.status,
                bookingdate: booking.preferredDate || booking.scheduledDate || null,
                notes: booking.notes || null,
                slotid: booking.slotId || null,
                useraccount: {
                    email: booking.customerEmail,
                    phonenumber: booking.customerPhone,
                    firstname: booking.customerName.split(" ")[0] || "",
                    lastname: booking.customerName.split(" ").slice(1).join(" ") || "",
                },
                vehicle: {
                    licenseplate: booking.vehicleVin || "",
                    year: undefined,
                    vehiclemodel: {
                        name: booking.vehicleModel,
                        brand: booking.vehicleBrand,
                    },
                },
                hasIntake: intakeBookingIds.has(booking.id),
                slotInfo: booking.slotInfo, // Include slot info from bookingschedule
            }));

            setBookings(mappedBookings);
        } catch (error) {
            console.error("Failed to load data:", error);
            toast.error("Không thể tải danh sách bookings");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    // Client-side filtering
    React.useEffect(() => {
        let filtered = bookings;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((booking) => {
                const customerName = `${booking.useraccount?.firstname || ""} ${booking.useraccount?.lastname || ""}`.toLowerCase();
                const phone = booking.useraccount?.phonenumber?.toLowerCase() || "";
                const licensePlate = booking.vehicle?.licenseplate?.toLowerCase() || "";
                const bookingId = booking.bookingid.toLowerCase();

                return (
                    customerName.includes(query) ||
                    phone.includes(query) ||
                    licensePlate.includes(query) ||
                    bookingId.includes(query)
                );
            });
        }

        setFilteredBookings(filtered);
    }, [bookings, searchQuery]);

    const handleCreateIntake = (booking: BookingFromSupabase) => {
        setSelectedBooking(booking);
        setDialogOpen(true);
    };

    const handleIntakeCreated = (intake: ServiceIntake) => {
        toast.success("Đã tạo intake thành công!");
        router.push(`/staff/service-intake/${intake.id}`);
    };

    const getCustomerName = (booking: BookingFromSupabase) => {
        if (!booking.useraccount) return "N/A";
        return `${booking.useraccount.firstname || ""} ${booking.useraccount.lastname || ""}`.trim() || "N/A";
    };

    const getVehicleInfo = (booking: BookingFromSupabase) => {
        if (!booking.vehicle?.vehiclemodel) return "N/A";
        return `${booking.vehicle.vehiclemodel.brand || ""} ${booking.vehicle.vehiclemodel.name || ""}`.trim();
    };

    const getSlotTimeDisplay = (booking: BookingWithIntakeStatus) => {
        if (booking.slotInfo) {
            return `${booking.slotInfo.startUtc} - ${booking.slotInfo.endUtc}`;
        }
        return "-";
    };

    const getBookingDateDisplay = (booking: BookingWithIntakeStatus) => {
        // Priority: bookingdate > show day of week from slot
        if (booking.bookingdate) {
            return formatDate(booking.bookingdate);
        }

        // If no bookingdate, show day of week from slot
        if (booking.slotInfo?.dayOfWeek) {
            const dayLabels: Record<string, string> = {
                'MON': 'Thứ 2',
                'TUE': 'Thứ 3',
                'WED': 'Thứ 4',
                'THU': 'Thứ 5',
                'FRI': 'Thứ 6',
                'SAT': 'Thứ 7',
                'SUN': 'Chủ nhật',
            };
            return dayLabels[booking.slotInfo.dayOfWeek] || booking.slotInfo.dayOfWeek;
        }

        return "-";
    };

    const bookingsWithoutIntake = filteredBookings.filter((b) => !b.hasIntake);
    const bookingsWithIntake = filteredBookings.filter((b) => b.hasIntake);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Bookings Chờ Tạo Intake</h1>
                    <p className="text-muted-foreground">
                        Danh sách bookings đã được approved, sẵn sàng tạo service intake
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm (khách hàng, điện thoại, biển số...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => loadData(true)}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                            Làm mới
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings without Intake */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Bookings Chưa Có Intake ({bookingsWithoutIntake.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {bookingsWithoutIntake.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Không có booking nào chờ tạo intake
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Booking ID</TableHead>
                                        <TableHead>Khách Hàng</TableHead>
                                        <TableHead>Điện Thoại</TableHead>
                                        <TableHead>Xe</TableHead>
                                        <TableHead>Biển Số</TableHead>
                                        <TableHead>Ngày Hẹn</TableHead>
                                        <TableHead>Giờ Hẹn</TableHead>
                                        <TableHead className="text-right">Thao Tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookingsWithoutIntake.map((booking) => (
                                        <TableRow key={booking.bookingid}>
                                            <TableCell className="font-mono text-xs">
                                                {booking.bookingid.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {getCustomerName(booking)}
                                                </div>
                                            </TableCell>
                                            <TableCell>{booking.useraccount?.phonenumber || "-"}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Car className="h-4 w-4 text-muted-foreground" />
                                                    {getVehicleInfo(booking)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {booking.vehicle?.licenseplate && booking.vehicle.licenseplate !== 'string'
                                                        ? booking.vehicle.licenseplate
                                                        : "-"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {getBookingDateDisplay(booking)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    {getSlotTimeDisplay(booking)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleCreateIntake(booking)}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Tạo Intake
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bookings with Intake (informational) */}
            {bookingsWithIntake.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-muted-foreground">
                            Bookings Đã Có Intake ({bookingsWithIntake.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border opacity-60">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Booking ID</TableHead>
                                        <TableHead>Khách Hàng</TableHead>
                                        <TableHead>Xe</TableHead>
                                        <TableHead>Biển Số</TableHead>
                                        <TableHead>Ngày Hẹn</TableHead>
                                        <TableHead>Giờ Hẹn</TableHead>
                                        <TableHead className="text-right">Trạng Thái</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookingsWithIntake.map((booking) => (
                                        <TableRow key={booking.bookingid}>
                                            <TableCell className="font-mono text-xs">
                                                {booking.bookingid.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>{getCustomerName(booking)}</TableCell>
                                            <TableCell>{getVehicleInfo(booking)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {booking.vehicle?.licenseplate && booking.vehicle.licenseplate !== 'string'
                                                        ? booking.vehicle.licenseplate
                                                        : "-"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getBookingDateDisplay(booking)}</TableCell>
                                            <TableCell>{getSlotTimeDisplay(booking)}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary">Đã có Intake</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Create Intake Dialog */}
            <CreateIntakeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                booking={
                    selectedBooking
                        ? {
                            bookingid: selectedBooking.bookingid,
                            customerName: getCustomerName(selectedBooking),
                            customerPhone: selectedBooking.useraccount?.phonenumber || "",
                            customerEmail: selectedBooking.useraccount?.email || "",
                            vehicleBrand: selectedBooking.vehicle?.vehiclemodel?.brand || "",
                            vehicleModel: selectedBooking.vehicle?.vehiclemodel?.name || "",
                            licensePlate: selectedBooking.vehicle?.licenseplate || "",
                            status: selectedBooking.status,
                        }
                        : null
                }
                onSuccess={handleIntakeCreated}
            />
        </div>
    );
}
