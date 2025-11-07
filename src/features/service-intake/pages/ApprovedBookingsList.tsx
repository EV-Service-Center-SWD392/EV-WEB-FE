/**
 * ApprovedBookingsList Page
 * List of approved bookings pending intake creation
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Loader2,
    RefreshCw,
    Search,
    Plus,
    Calendar,
    User,
    Car,
    Clock,
    CheckCircle2,
    FileCheck,
    AlertCircle
} from "lucide-react";

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
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-md">
                            <FileCheck className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Approved Bookings - Intake Queue</h1>
                    </div>
                    <p className="text-muted-foreground ml-[60px]">
                        Approved bookings ready for service intake creation
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card className="shadow-sm border-gray-200">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by customer, phone, license plate, or booking ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-gray-300"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => loadData(true)}
                            disabled={isRefreshing}
                            className="border-gray-300 hover:bg-gray-50"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings without Intake */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Bookings Awaiting Intake ({bookingsWithoutIntake.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {bookingsWithoutIntake.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                            <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-sm">
                                <CheckCircle2 className="h-12 w-12 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">No bookings pending intake</p>
                            <p className="text-sm text-muted-foreground">All approved bookings have intakes created</p>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold">Booking ID</TableHead>
                                        <TableHead className="font-semibold">Customer</TableHead>
                                        <TableHead className="font-semibold">Phone</TableHead>
                                        <TableHead className="font-semibold">Vehicle</TableHead>
                                        <TableHead className="font-semibold">License Plate</TableHead>
                                        <TableHead className="font-semibold">Appointment Date</TableHead>
                                        <TableHead className="font-semibold">Time Slot</TableHead>
                                        <TableHead className="text-right font-semibold">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookingsWithoutIntake.map((booking) => (
                                        <TableRow key={booking.bookingid} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="font-mono text-xs text-gray-600">
                                                {booking.bookingid.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                    <span className="font-medium text-gray-900">{getCustomerName(booking)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-700">{booking.useraccount?.phonenumber || "-"}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Car className="h-4 w-4 text-green-600" />
                                                    <span className="text-gray-900">{getVehicleInfo(booking)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono border-gray-300">
                                                    {booking.vehicle?.licenseplate && booking.vehicle.licenseplate !== 'string'
                                                        ? booking.vehicle.licenseplate
                                                        : "-"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-gray-700">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    {getBookingDateDisplay(booking)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-gray-700">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    {getSlotTimeDisplay(booking)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleCreateIntake(booking)}
                                                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create Intake
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
                <Card className="shadow-sm border-gray-200 opacity-75">
                    <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                        <CardTitle className="flex items-center gap-2 text-gray-600">
                            <AlertCircle className="h-5 w-5" />
                            Bookings with Existing Intake ({bookingsWithIntake.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold">Booking ID</TableHead>
                                        <TableHead className="font-semibold">Customer</TableHead>
                                        <TableHead className="font-semibold">Vehicle</TableHead>
                                        <TableHead className="font-semibold">License Plate</TableHead>
                                        <TableHead className="font-semibold">Appointment Date</TableHead>
                                        <TableHead className="font-semibold">Time Slot</TableHead>
                                        <TableHead className="text-right font-semibold">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookingsWithIntake.map((booking) => (
                                        <TableRow key={booking.bookingid} className="hover:bg-gray-50">
                                            <TableCell className="font-mono text-xs text-gray-600">
                                                {booking.bookingid.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell className="text-gray-700">{getCustomerName(booking)}</TableCell>
                                            <TableCell className="text-gray-700">{getVehicleInfo(booking)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-gray-300 font-mono">
                                                    {booking.vehicle?.licenseplate && booking.vehicle.licenseplate !== 'string'
                                                        ? booking.vehicle.licenseplate
                                                        : "-"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-700">{getBookingDateDisplay(booking)}</TableCell>
                                            <TableCell className="text-gray-700">{getSlotTimeDisplay(booking)}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Intake Created
                                                </Badge>
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
