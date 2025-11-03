"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
    Calendar,
    CheckCircle,
    Clock,
    User,
} from "lucide-react";

import { bookingApprovalService } from "@/services/bookingApprovalService";
import { assignmentService } from "@/services/assignmentService";
import { userService } from "@/services/userService";
import type { BookingApprovalDto } from "@/entities/booking-approval.types";
import type { User as UserType } from "@/entities/user.types";
import { UserRole } from "@/entities/user.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { BookingCard } from "@/components/staff/BookingCard";

export default function BookingAssignmentPage() {
    const [approvedBookings, setApprovedBookings] = useState<
        BookingApprovalDto[]
    >([]);
    const [technicians, setTechnicians] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] =
        useState<BookingApprovalDto | null>(null);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
    const [assignmentNote, setAssignmentNote] = useState("");
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [assigning, setAssigning] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        customerName: "",
        email: "",
        phone: "",
        vehicleType: "",
        vehicleBrand: "",
        vehicleModel: "",
        serviceCenterId: "",
        serviceType: "",
        preferredTime: "",
        scheduledDate: "",
        repairParts: "",
        description: "",
    });

    const updateFilter = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            customerName: "",
            email: "",
            phone: "",
            vehicleType: "",
            vehicleBrand: "",
            vehicleModel: "",
            serviceCenterId: "",
            serviceType: "",
            preferredTime: "",
            scheduledDate: "",
            repairParts: "",
            description: "",
        });
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.scheduledDate]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load approved bookings that haven't been assigned yet
            const [bookingsResponse, techsResponse] = await Promise.all([
                bookingApprovalService.getPendingBookings(
                    filters.scheduledDate ? { date: filters.scheduledDate } : undefined
                ),
                userService.getUsers({ role: UserRole.TECHNICIAN }),
            ]);

            // Filter for APPROVED status only (ready for assignment)
            const approvedOnly = bookingsResponse.filter(
                (b) => b.status === "APPROVED"
            );

            setApprovedBookings(approvedOnly);
            setTechnicians(techsResponse);
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignClick = (booking: BookingApprovalDto) => {
        setSelectedBooking(booking);
        setSelectedTechnicianId("");
        setAssignmentNote("");
        setShowAssignDialog(true);
    };

    const handleAssignSubmit = async () => {
        if (!selectedBooking || !selectedTechnicianId) {
            toast.error("Please select a technician");
            return;
        }

        try {
            setAssigning(true);

            // Create assignment
            await assignmentService.create({
                centerId: selectedBooking.centerId || "",
                technicianId: selectedTechnicianId,
                bookingId: selectedBooking.id,
                plannedStartUtc: selectedBooking.preferredStartUtc,
                note: assignmentNote || undefined,
            });

            toast.success("Booking assigned successfully!");
            setShowAssignDialog(false);
            loadData(); // Refresh list
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Failed to assign booking");
        } finally {
            setAssigning(false);
        }
    };

    const formatDateTime = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    // Client-side filtering (until backend supports full filter params)
    // ⚠️ NOTE: BookingApprovalDto currently only has IDs, not detailed customer/vehicle info
    // TODO: Backend needs to enhance /api/BookingApproval/pending response to include:
    //       - customer: { name, email, phone }
    //       - vehicle: { type, brand, model }
    //       - serviceType: string
    //       - repairParts: string
    //       - description: string
    // For now, only scheduled date filter works (API-level)
    const filteredBookings = useMemo(() => {
        // If backend eventually returns detailed info, uncomment filtering logic
        return approvedBookings;

        /* Uncomment when backend provides full booking details:
        return approvedBookings.filter(booking => {
            if (filters.customerName && !booking.customer?.name?.toLowerCase().includes(filters.customerName.toLowerCase())) {
                return false;
            }
            if (filters.email && !booking.customer?.email?.toLowerCase().includes(filters.email.toLowerCase())) {
                return false;
            }
            if (filters.phone && !booking.customer?.phone?.includes(filters.phone)) {
                return false;
            }
            if (filters.vehicleType && booking.vehicle?.type !== filters.vehicleType) {
                return false;
            }
            if (filters.vehicleBrand && !booking.vehicle?.brand?.toLowerCase().includes(filters.vehicleBrand.toLowerCase())) {
                return false;
            }
            if (filters.vehicleModel && !booking.vehicle?.model?.toLowerCase().includes(filters.vehicleModel.toLowerCase())) {
                return false;
            }
            if (filters.serviceType && !booking.serviceType?.toLowerCase().includes(filters.serviceType.toLowerCase())) {
                return false;
            }
            if (filters.repairParts && !booking.repairParts?.toLowerCase().includes(filters.repairParts.toLowerCase())) {
                return false;
            }
            if (filters.description && !booking.description?.toLowerCase().includes(filters.description.toLowerCase())) {
                return false;
            }
            return true;
        });
        */
    }, [approvedBookings]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Booking Assignment</h1>
                <p className="text-muted-foreground mt-2">
                    Assign approved bookings to technicians
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Bộ lọc tìm kiếm</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Customer Name */}
                        <div>
                            <Label htmlFor="customerName">Tên khách hàng</Label>
                            <Input
                                id="customerName"
                                placeholder="Nhập tên..."
                                value={filters.customerName}
                                onChange={(e) => updateFilter('customerName', e.target.value)}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Nhập email..."
                                value={filters.email}
                                onChange={(e) => updateFilter('email', e.target.value)}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                                id="phone"
                                placeholder="Nhập SĐT..."
                                value={filters.phone}
                                onChange={(e) => updateFilter('phone', e.target.value)}
                            />
                        </div>

                        {/* Vehicle Type */}
                        <div>
                            <Label htmlFor="vehicleType">Loại xe</Label>
                            <Select
                                value={filters.vehicleType || "all"}
                                onValueChange={(value) => updateFilter('vehicleType', value === "all" ? "" : value)}
                            >
                                <SelectTrigger id="vehicleType">
                                    <SelectValue placeholder="Chọn loại xe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="xe máy">Xe máy điện</SelectItem>
                                    <SelectItem value="ô tô điện">Ô tô điện</SelectItem>
                                    <SelectItem value="xe đạp điện">Xe đạp điện</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Vehicle Brand */}
                        <div>
                            <Label htmlFor="vehicleBrand">Hãng xe</Label>
                            <Input
                                id="vehicleBrand"
                                placeholder="VD: VinFast, Tesla..."
                                value={filters.vehicleBrand}
                                onChange={(e) => updateFilter('vehicleBrand', e.target.value)}
                            />
                        </div>

                        {/* Vehicle Model */}
                        <div>
                            <Label htmlFor="vehicleModel">Model</Label>
                            <Input
                                id="vehicleModel"
                                placeholder="VD: VF8, Model 3..."
                                value={filters.vehicleModel}
                                onChange={(e) => updateFilter('vehicleModel', e.target.value)}
                            />
                        </div>

                        {/* Service Type */}
                        <div>
                            <Label htmlFor="serviceType">Loại dịch vụ</Label>
                            <Input
                                id="serviceType"
                                placeholder="VD: Bảo dưỡng, Sửa chữa..."
                                value={filters.serviceType}
                                onChange={(e) => updateFilter('serviceType', e.target.value)}
                            />
                        </div>

                        {/* Scheduled Date */}
                        <div>
                            <Label htmlFor="scheduledDate">Ngày hẹn</Label>
                            <Input
                                id="scheduledDate"
                                type="date"
                                value={filters.scheduledDate}
                                onChange={(e) => updateFilter('scheduledDate', e.target.value)}
                            />
                        </div>

                        {/* Preferred Time */}
                        <div>
                            <Label htmlFor="preferredTime">Giờ mong muốn</Label>
                            <Input
                                id="preferredTime"
                                type="time"
                                value={filters.preferredTime}
                                onChange={(e) => updateFilter('preferredTime', e.target.value)}
                            />
                        </div>

                        {/* Repair Parts */}
                        <div>
                            <Label htmlFor="repairParts">Bộ phận cần sửa</Label>
                            <Input
                                id="repairParts"
                                placeholder="VD: Pin, Phanh..."
                                value={filters.repairParts}
                                onChange={(e) => updateFilter('repairParts', e.target.value)}
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Input
                                id="description"
                                placeholder="Tìm trong mô tả..."
                                value={filters.description}
                                onChange={(e) => updateFilter('description', e.target.value)}
                            />
                        </div>

                        {/* Clear Button */}
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="w-full"
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Approved Bookings
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredBookings.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Ready for assignment
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Available Technicians
                        </CardTitle>
                        <User className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{technicians.length}</div>
                        <p className="text-xs text-muted-foreground">Active technicians</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Today&apos;s Bookings
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {
                                filteredBookings.filter((b) => {
                                    if (!b.preferredStartUtc) return false;
                                    const bookingDate = new Date(b.preferredStartUtc);
                                    const today = new Date();
                                    return bookingDate.toDateString() === today.toDateString();
                                }).length
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">Scheduled for today</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bookings List */}
            <Card>
                <CardHeader>
                    <CardTitle>Approved Bookings ({filteredBookings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-12 bg-muted/10 rounded-lg">
                            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-medium text-muted-foreground mb-2">
                                Không có booking nào phù hợp
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {Object.values(filters).some(v => v)
                                    ? 'Thử điều chỉnh bộ lọc để xem thêm kết quả'
                                    : 'Chưa có booking đã duyệt nào cần phân công'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map((booking) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onAssignAction={handleAssignClick}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Assignment Dialog */}
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Booking to Technician</DialogTitle>
                        <DialogDescription>
                            Select a technician to handle this booking
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {selectedBooking && (
                            <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                                <div>
                                    <strong>Booking:</strong> #{selectedBooking.id.slice(0, 8)}
                                </div>
                                <div>
                                    <strong>Time:</strong>{" "}
                                    {formatDateTime(selectedBooking.preferredStartUtc)} -{" "}
                                    {formatDateTime(selectedBooking.preferredEndUtc)}
                                </div>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="technician">Technician *</Label>
                            <Select
                                value={selectedTechnicianId}
                                onValueChange={setSelectedTechnicianId}
                            >
                                <SelectTrigger id="technician">
                                    <SelectValue placeholder="Select a technician" />
                                </SelectTrigger>
                                <SelectContent>
                                    {technicians.map((tech) => (
                                        <SelectItem key={tech.id} value={tech.id}>
                                            {tech.name} - {tech.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="note">Note (Optional)</Label>
                            <Textarea
                                id="note"
                                value={assignmentNote}
                                onChange={(e) => setAssignmentNote(e.target.value)}
                                placeholder="Add any additional notes for the technician..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowAssignDialog(false)}
                            disabled={assigning}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAssignSubmit} disabled={assigning}>
                            {assigning ? "Assigning..." : "Assign"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
