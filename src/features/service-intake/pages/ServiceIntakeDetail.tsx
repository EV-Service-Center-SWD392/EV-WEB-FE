/**
 * ServiceIntakeDetail Page
 * Displays detailed information about a service intake with contextual actions
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    ArrowLeft,
    Loader2,
    Calendar,
    User,
    Car,
    Gauge,
    Battery,
    FileText,
    ClipboardList,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { ServiceIntake } from "@/entities/intake.types";
import { getIntake } from "@/services/intakeService";
import { IntakeStatusBadge } from "../components/IntakeStatusBadge";
import { supabase } from "@/lib/supabase";

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

interface ServiceIntakeDetailProps {
    intakeId: string;
}

interface CustomerInfo {
    fullName: string;
    email: string;
    phone: string;
    address: string;
}

interface VehicleInfo {
    licensePlate: string;
    brand: string;
    model: string;
    type: string;
    year?: number;
    color?: string;
}

export default function ServiceIntakeDetail({ intakeId }: ServiceIntakeDetailProps) {
    const router = useRouter();
    const [intake, setIntake] = React.useState<ServiceIntake | null>(null);
    const [customerInfo, setCustomerInfo] = React.useState<CustomerInfo | null>(null);
    const [vehicleInfo, setVehicleInfo] = React.useState<VehicleInfo | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const loadIntake = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getIntake(intakeId);
            setIntake(data);

            // Lấy thông tin xe từ vehicleId với join vehiclemodel
            if (data.vehicleId) {
                try {
                    const { data: vehicle, error: vehicleError } = await supabase
                        .from('vehicle')
                        .select(`
                            licenseplate,
                            year,
                            color,
                            vehiclemodel!inner (
                                name,
                                brand
                            )
                        `)
                        .eq('vehicleid', data.vehicleId)
                        .single();

                    if (!vehicleError && vehicle) {
                        // vehiclemodel can be an object or array, handle both cases
                        const model = Array.isArray(vehicle.vehiclemodel)
                            ? vehicle.vehiclemodel[0]
                            : vehicle.vehiclemodel;

                        setVehicleInfo({
                            licensePlate: vehicle.licenseplate || '',
                            brand: model?.brand || '',
                            model: model?.name || '',
                            type: '', // Vehicle type not available in database
                            year: vehicle.year,
                            color: vehicle.color,
                        });
                    } else {
                        console.warn('Failed to fetch vehicle:', vehicleError);
                    }
                } catch (err) {
                    console.error('Error fetching vehicle:', err);
                }
            }

            // Nếu có bookingId, lấy thông tin khách hàng từ Supabase
            if (data.bookingId) {
                const { data: booking, error: bookingError } = await supabase
                    .from('bookinghuykt')
                    .select('customerid')
                    .eq('bookingid', data.bookingId)
                    .single();

                if (!bookingError && booking) {
                    const { data: customer, error: customerError } = await supabase
                        .from('useraccount')
                        .select('email, phonenumber, lastname, firstname, address')
                        .eq('userid', booking.customerid)
                        .single();

                    if (!customerError && customer) {
                        setCustomerInfo({
                            fullName: `${customer.firstname || ''} ${customer.lastname || ''}`.trim(),
                            email: customer.email || '',
                            phone: customer.phonenumber || '',
                            address: customer.address || '',
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load intake:", error);
            toast.error("Không thể tải thông tin intake");
            router.push("/staff/service-intake");
        } finally {
            setIsLoading(false);
        }
    }, [intakeId, router]);

    React.useEffect(() => {
        loadIntake();
    }, [loadIntake]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!intake) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center">
                    <p className="text-muted-foreground">Không tìm thấy intake</p>
                    <Button onClick={() => router.push("/staff/service-intake")} className="mt-4">
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div>
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <ClipboardList className="h-8 w-8" />
                            Chi Tiết Service Intake
                        </h1>
                        <p className="text-muted-foreground mt-2">ID: {intake.id}</p>
                    </div>
                    <IntakeStatusBadge status={intake.status} showDescription />
                </div>
            </div>

            {/* Thông Tin Booking & Khách Hàng */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Thông Tin Booking & Khách Hàng
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Booking Info Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Thông Tin Đặt Lịch</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Mã Intake</p>
                                <div className="font-medium mt-1">
                                    <Badge variant="default" className="font-mono text-xs">
                                        {intake.id.slice(0, 8)}...
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Mã Booking</p>
                                <div className="font-medium mt-1">
                                    {intake.bookingCode || intake.bookingId ? (
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {intake.bookingCode || intake.bookingId?.slice(0, 8)}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Walk-in</Badge>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Trạng Thái</p>
                                <div className="mt-1">
                                    <IntakeStatusBadge status={intake.status} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Ngày Tạo</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium text-sm">{formatDateTime(intake.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info Section */}
                    {customerInfo && (
                        <>
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Thông Tin Khách Hàng
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Họ Tên</p>
                                        <p className="font-medium mt-1">{customerInfo.fullName || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Điện Thoại</p>
                                        <p className="font-medium mt-1">{customerInfo.phone || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium mt-1">{customerInfo.email || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Địa Chỉ</p>
                                        <p className="font-medium mt-1">{customerInfo.address || "-"}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Fallback to intake data if no customerInfo */}
                    {!customerInfo && intake.bookingId && (
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Thông Tin Khách Hàng (từ Intake)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Họ Tên</p>
                                    <p className="font-medium mt-1">{intake.customerName || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Điện Thoại</p>
                                    <p className="font-medium mt-1">{intake.customerPhone || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium mt-1">{intake.customerEmail || "-"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Thông Tin Xe
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Hãng Xe</p>
                        <p className="font-medium">{vehicleInfo?.brand || intake.vehicleBrand || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Model</p>
                        <p className="font-medium">{vehicleInfo?.model || intake.vehicleModel || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Biển Số</p>
                        <div className="font-medium">
                            <Badge variant="outline" className="font-mono">
                                {vehicleInfo?.licensePlate ||
                                    (intake.licensePlate && intake.licensePlate !== 'string' ? intake.licensePlate : "-")}
                            </Badge>
                        </div>
                    </div>
                    {(vehicleInfo?.type || intake.vehicleType) && (
                        <div>
                            <p className="text-sm text-muted-foreground">Loại Xe</p>
                            <p className="font-medium">{vehicleInfo?.type || intake.vehicleType}</p>
                        </div>
                    )}
                    {vehicleInfo?.year && (
                        <div>
                            <p className="text-sm text-muted-foreground">Năm Sản Xuất</p>
                            <p className="font-medium">{vehicleInfo.year}</p>
                        </div>
                    )}
                    {vehicleInfo?.color && (
                        <div>
                            <p className="text-sm text-muted-foreground">Màu Sắc</p>
                            <p className="font-medium">{vehicleInfo.color}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Vehicle Condition */}
            <Card>
                <CardHeader>
                    <CardTitle>Tình Trạng Xe Khi Đến</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-50">
                            <Gauge className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Số Km (Odometer)</p>
                            <p className="text-2xl font-bold">
                                {intake.odometer !== undefined && intake.odometer !== null ? intake.odometer.toLocaleString() : "-"} km
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-50">
                            <Battery className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Mức Pin (SoC)</p>
                            <p className="text-2xl font-bold">
                                {intake.batteryPercent !== undefined ? `${intake.batteryPercent}%` : "-"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notes */}
            {(intake.arrivalNotes || intake.notes) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Ghi Chú</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {intake.arrivalNotes && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                    Ghi Chú Khi Đến
                                </p>
                                <p className="text-sm p-3 bg-muted rounded-md">{intake.arrivalNotes}</p>
                            </div>
                        )}
                        {intake.notes && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                    Ghi Chú Chung
                                </p>
                                <p className="text-sm p-3 bg-muted rounded-md">{intake.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Metadata */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông Tin Hệ Thống</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Ngày Tạo</p>
                        <p className="font-medium">{formatDateTime(intake.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Cập Nhật Lần Cuối</p>
                        <p className="font-medium">{formatDateTime(intake.updatedAt ?? undefined)}</p>
                    </div>
                    {intake.verifiedAt && (
                        <div>
                            <p className="text-muted-foreground">Xác Minh Lúc</p>
                            <p className="font-medium">{formatDateTime(intake.verifiedAt)}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
