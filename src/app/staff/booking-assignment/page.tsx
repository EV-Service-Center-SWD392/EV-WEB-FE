"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    Database,
    Cloud,
    Filter,
    ClipboardList,
    Mail,
    Phone,
    Car,
    Package,
    AlertCircle,
    RotateCw,
    FileText,
} from "lucide-react";

import { bookingService } from "@/services/bookingService";
import { directBookingService } from "@/services/directBookingService";
import { bookingApprovalService } from "@/services/bookingApprovalService";
import type { BookingResponseDto, BookingQueryDto } from "@/entities/booking.types";

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
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function BookingAssignmentPage() {
    const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Toggle between API and Direct Database
    const [useDirectDB, setUseDirectDB] = useState(true); // true = Direct DB, false = API

    // Reject Dialog
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [selectedBookingForReject, setSelectedBookingForReject] = useState<BookingResponseDto | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Filter states
    const [filters, setFilters] = useState<BookingQueryDto & {
        customerName?: string;
        email?: string;
        phone?: string;
        vehicleBrand?: string;
        vehicleModel?: string;
        serviceType?: string;
    }>({
        status: undefined, // Show all: Pending, Approved, Rejected
        page: 1,
        pageSize: 50,
    });

    const updateFilter = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: undefined,
            page: 1,
            pageSize: 50,
        });
    };

    useEffect(() => {
        loadBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.status, filters.fromDate, filters.toDate, filters.centerId, useDirectDB]);

    const loadBookings = async () => {
        try {
            setLoading(true);

            if (useDirectDB) {
                // ✅ CÁCH 1: Query trực tiếp từ Database (không phụ thuộc API của partner)
                const response = await directBookingService.getAllBookings({
                    status: filters.status,
                    centerId: filters.centerId,
                    fromDate: filters.fromDate,
                    toDate: filters.toDate,
                });
                setBookings(Array.isArray(response) ? response : []);
            } else {
                // ❌ CÁCH 2: Gọi qua API của partner (có thể bị lỗi)

                // Debug: Check if token exists
                const token = localStorage.getItem("access_token");
                if (!token) {
                    toast.error("No access token found. Please login first.");
                    console.error("[BookingAssignment] No token found in localStorage");
                    return;
                }

                // Call API: GET /api/client/Booking
                const query: BookingQueryDto = {
                    page: filters.page,
                    pageSize: filters.pageSize,
                    status: filters.status,
                    centerId: filters.centerId,
                    fromDate: filters.fromDate,
                    toDate: filters.toDate,
                };

                const response = await bookingService.getClientBookings(query);
                // Ensure response is always an array
                setBookings(Array.isArray(response) ? response : []);
            }
        } catch (error) {
            const err = error as Error;
            console.error("[BookingAssignment] Error loading bookings:", error);

            // Check if 401 error
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number } };
                if (axiosError.response?.status === 401) {
                    toast.error("Session expired. Please login again.");
                    // Optional: redirect to login
                    // window.location.href = '/login';
                    return;
                }
            }

            toast.error(err.message || "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (booking: BookingResponseDto) => {
        try {
            setActionLoading(booking.id);

            // ✅ Call API: POST /api/BookingApproval/approve
            await bookingApprovalService.approveBooking({
                bookingId: booking.id,
                note: "Approved by staff",
            });

            toast.success(`Booking #${booking.bookingCode || booking.id.slice(0, 8)} approved!`);

            // ✅ Reload data from current source (Direct DB or Partner API)
            await loadBookings();
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Failed to approve booking");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectClick = (booking: BookingResponseDto) => {
        setSelectedBookingForReject(booking);
        setRejectReason("");
        setShowRejectDialog(true);
    };

    const handleRejectSubmit = async () => {
        if (!selectedBookingForReject) return;

        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        try {
            setActionLoading(selectedBookingForReject.id);

            // ✅ Call API: POST /api/BookingApproval/reject
            await bookingApprovalService.rejectBooking({
                bookingId: selectedBookingForReject.id,
                reason: rejectReason.trim(),
            });

            toast.success(`Booking #${selectedBookingForReject.bookingCode || selectedBookingForReject.id.slice(0, 8)} rejected`);

            // Close dialog first
            setShowRejectDialog(false);
            setSelectedBookingForReject(null);
            setRejectReason("");

            // ✅ Reload data from current source (Direct DB or Partner API)
            await loadBookings();
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Failed to reject booking");
        } finally {
            setActionLoading(null);
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

    // Client-side filtering for fields not supported by API
    const filteredBookings = useMemo(() => {
        // Ensure bookings is an array before filtering
        if (!Array.isArray(bookings)) {
            return [];
        }

        return bookings.filter(booking => {
            if (filters.customerName && !booking.customerName?.toLowerCase().includes(filters.customerName.toLowerCase())) {
                return false;
            }
            if (filters.email && !booking.customerEmail?.toLowerCase().includes(filters.email.toLowerCase())) {
                return false;
            }
            if (filters.phone && !booking.customerPhone?.includes(filters.phone)) {
                return false;
            }
            if (filters.vehicleBrand && !booking.vehicleBrand?.toLowerCase().includes(filters.vehicleBrand.toLowerCase())) {
                return false;
            }
            if (filters.vehicleModel && !booking.vehicleModel?.toLowerCase().includes(filters.vehicleModel.toLowerCase())) {
                return false;
            }
            if (filters.serviceType && !booking.serviceType?.toLowerCase().includes(filters.serviceType.toLowerCase())) {
                return false;
            }
            return true;
        });
    }, [bookings, filters]);

    const getStatusBadge = (status: "Pending" | "Approved" | "Rejected") => {
        switch (status) {
            case "Pending":
                return (
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50 font-medium">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case "Approved":
                return (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 font-medium">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case "Rejected":
                return (
                    <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50 font-medium">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

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
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
                            <ClipboardList className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Booking Assignment</h1>
                    </div>
                    <p className="text-muted-foreground ml-[60px]">
                        Review and manage customer service bookings
                    </p>
                </div>

                {/* Toggle Database/API Mode */}
                <div className="flex items-center gap-3 bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-sm font-medium text-gray-700">Data Source:</span>
                    <Button
                        variant={useDirectDB ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseDirectDB(true)}
                        className={`flex items-center gap-2 ${useDirectDB ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    >
                        <Database className="h-4 w-4" />
                        Direct DB
                    </Button>
                    <Button
                        variant={!useDirectDB ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseDirectDB(false)}
                        className={`flex items-center gap-2 ${!useDirectDB ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    >
                        <Cloud className="h-4 w-4" />
                        Partner API
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Filter className="h-5 w-5 text-blue-600" />
                        Search Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div>
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select
                                value={filters.status || "all"}
                                onValueChange={(value) => updateFilter('status', value === "all" ? "" : value)}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* From Date */}
                        <div>
                            <Label htmlFor="fromDate">Từ ngày</Label>
                            <Input
                                id="fromDate"
                                type="date"
                                value={filters.fromDate || ""}
                                onChange={(e) => updateFilter('fromDate', e.target.value)}
                            />
                        </div>

                        {/* To Date */}
                        <div>
                            <Label htmlFor="toDate">Đến ngày</Label>
                            <Input
                                id="toDate"
                                type="date"
                                value={filters.toDate || ""}
                                onChange={(e) => updateFilter('toDate', e.target.value)}
                            />
                        </div>

                        {/* Customer Name */}
                        <div>
                            <Label htmlFor="customerName">Tên khách hàng</Label>
                            <Input
                                id="customerName"
                                placeholder="Nhập tên..."
                                value={filters.customerName || ""}
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
                                value={filters.email || ""}
                                onChange={(e) => updateFilter('email', e.target.value)}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                                id="phone"
                                placeholder="Nhập SĐT..."
                                value={filters.phone || ""}
                                onChange={(e) => updateFilter('phone', e.target.value)}
                            />
                        </div>

                        {/* Vehicle Brand */}
                        <div>
                            <Label htmlFor="vehicleBrand">Hãng xe</Label>
                            <Input
                                id="vehicleBrand"
                                placeholder="VD: VinFast, Tesla..."
                                value={filters.vehicleBrand || ""}
                                onChange={(e) => updateFilter('vehicleBrand', e.target.value)}
                            />
                        </div>

                        {/* Vehicle Model */}
                        <div>
                            <Label htmlFor="vehicleModel">Model</Label>
                            <Input
                                id="vehicleModel"
                                placeholder="VD: VF8, Model 3..."
                                value={filters.vehicleModel || ""}
                                onChange={(e) => updateFilter('vehicleModel', e.target.value)}
                            />
                        </div>

                        {/* Service Type */}
                        <div>
                            <Label htmlFor="serviceType">Loại dịch vụ</Label>
                            <Input
                                id="serviceType"
                                placeholder="VD: Bảo dưỡng, Sửa chữa..."
                                value={filters.serviceType || ""}
                                onChange={(e) => updateFilter('serviceType', e.target.value)}
                            />
                        </div>

                        {/* Clear Button */}
                        <div className="flex items-end md:col-span-3">
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="w-full md:w-auto"
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Bookings
                        </CardTitle>
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{filteredBookings.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">All bookings in system</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Pending
                        </CardTitle>
                        <div className="bg-yellow-100 p-2 rounded-lg">
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {filteredBookings.filter(b => b.status === "Pending").length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Approved
                        </CardTitle>
                        <div className="bg-green-100 p-2 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {filteredBookings.filter(b => b.status === "Approved").length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Ready for service</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Rejected
                        </CardTitle>
                        <div className="bg-red-100 p-2 rounded-lg">
                            <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {filteredBookings.filter(b => b.status === "Rejected").length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Declined bookings</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bookings List */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Bookings ({filteredBookings.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                            <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-sm">
                                <AlertCircle className="h-12 w-12 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">
                                No bookings found
                            </p>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                {Object.values(filters).some(v => v && v !== "all")
                                    ? 'Try adjusting your filters to see more results'
                                    : 'No bookings available in the system yet'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map((booking) => (
                                <Card key={booking.id} className="p-5 hover:shadow-lg transition-all duration-200 border-gray-200 bg-gradient-to-br from-white to-gray-50">
                                    <div className="space-y-4">
                                        {/* Header Row */}
                                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-blue-100 p-2 rounded-lg">
                                                        <Package className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <h3 className="font-semibold text-lg text-gray-900">
                                                        {booking.customerName}
                                                    </h3>
                                                </div>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                            <Badge variant="outline" className="font-mono text-xs border-gray-300">
                                                #{booking.bookingCode || booking.id.slice(0, 8)}
                                            </Badge>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-600">Email:</span>
                                                <span className="text-gray-900">{booking.customerEmail}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-600">Phone:</span>
                                                <span className="text-gray-900">{booking.customerPhone}</span>
                                            </div>
                                        </div>

                                        {/* Vehicle Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-blue-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Car className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium text-gray-600">Brand:</span>
                                                <span className="text-gray-900 font-semibold">{booking.vehicleBrand}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Car className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium text-gray-600">Model:</span>
                                                <span className="text-gray-900 font-semibold">{booking.vehicleModel}</span>
                                            </div>
                                        </div>

                                        {/* Preferred Date */}
                                        {booking.preferredDate && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-600">Preferred Date:</span>
                                                <span className="text-gray-900">{booking.preferredDate}</span>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {booking.notes && (
                                            <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                                                <div className="flex items-start gap-2 text-sm">
                                                    <FileText className="h-4 w-4 text-yellow-600 mt-0.5" />
                                                    <div>
                                                        <span className="font-medium text-gray-700">Notes:</span>
                                                        <p className="text-gray-900 mt-1">{booking.notes}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Created Date */}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-gray-100">
                                            <Clock className="h-3 w-3" />
                                            Created: {formatDateTime(booking.createdAt)}
                                        </div>

                                        {/* Action Buttons */}
                                        {booking.status === "Pending" && (
                                            <div className="flex gap-3 pt-4 mt-2 border-t-2 border-gray-200">
                                                <Button
                                                    size="lg"
                                                    variant="default"
                                                    onClick={() => handleApprove(booking)}
                                                    disabled={actionLoading === booking.id}
                                                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex-1 h-11 shadow-md hover:shadow-lg transition-all"
                                                >
                                                    {actionLoading === booking.id ? (
                                                        <>
                                                            <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Approve Booking
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    variant="destructive"
                                                    onClick={() => handleRejectClick(booking)}
                                                    disabled={actionLoading === booking.id}
                                                    className="flex-1 h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all"
                                                >
                                                    {actionLoading === booking.id ? (
                                                        <>
                                                            <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Reject Booking
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="sm:max-w-[550px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2 text-red-600">
                            <XCircle className="h-6 w-6" />
                            Reject Booking
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 text-base mt-2">
                            Please provide a reason for rejecting this booking. This will be sent to the customer.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        {selectedBookingForReject && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg space-y-2.5">
                                <div className="flex items-start gap-3">
                                    <strong className="min-w-[90px] text-gray-700 font-semibold">Customer:</strong>
                                    <span className="text-gray-900 font-medium">{selectedBookingForReject.customerName}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <strong className="min-w-[90px] text-gray-700 font-semibold">Booking ID:</strong>
                                    <span className="text-gray-900 font-mono">#{selectedBookingForReject.bookingCode || selectedBookingForReject.id.slice(0, 8)}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <strong className="min-w-[90px] text-gray-700 font-semibold">Vehicle:</strong>
                                    <span className="text-gray-900">{selectedBookingForReject.vehicleBrand} {selectedBookingForReject.vehicleModel}</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <Label htmlFor="rejectReason" className="text-base font-bold text-gray-800">
                                Reason for Rejection <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="rejectReason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g., Vehicle model not supported, Missing required documents, Outside service area..."
                                rows={5}
                                className="resize-none border-2 border-gray-300 focus:border-red-500 text-gray-900 placeholder:text-gray-400 bg-white"
                                required
                            />
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <span className="text-red-500">•</span>
                                Minimum 10 characters required
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectDialog(false);
                                setSelectedBookingForReject(null);
                                setRejectReason("");
                            }}
                            disabled={actionLoading !== null}
                            className="min-w-[120px] h-11 text-base border-2 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectSubmit}
                            disabled={actionLoading !== null || !rejectReason.trim() || rejectReason.trim().length < 10}
                            className="min-w-[150px] h-11 text-base bg-red-600 hover:bg-red-700 text-white font-semibold"
                        >
                            {actionLoading ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-5 w-5 mr-2" />
                                    Reject Booking
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
