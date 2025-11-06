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
import { IntakeActionButtons } from "../components/IntakeActionButtons";

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

export default function ServiceIntakeDetail({ intakeId }: ServiceIntakeDetailProps) {
    const router = useRouter();
    const [intake, setIntake] = React.useState<ServiceIntake | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const loadIntake = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getIntake(intakeId);
            setIntake(data);
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

    const handleActionSuccess = (updatedIntake: ServiceIntake) => {
        setIntake(updatedIntake);
        toast.success("Cập nhật thành công!");
    };

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

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Thao Tác</CardTitle>
                </CardHeader>
                <CardContent>
                    <IntakeActionButtons intake={intake} onSuccess={handleActionSuccess} />
                </CardContent>
            </Card>

            {/* Booking Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Thông Tin Booking
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Mã Booking</p>
                        <p className="font-medium">
                            {intake.bookingCode ? (
                                <Badge variant="outline">{intake.bookingCode}</Badge>
                            ) : (
                                <Badge variant="secondary">Walk-in</Badge>
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Trung Tâm</p>
                        <p className="font-medium">{intake.serviceCenterName || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Ngày Hẹn</p>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{formatDateTime(intake.scheduledDate)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Thông Tin Khách Hàng
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Họ Tên</p>
                        <p className="font-medium">{intake.customerName || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Điện Thoại</p>
                        <p className="font-medium">{intake.customerPhone || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{intake.customerEmail || "-"}</p>
                    </div>
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
                        <p className="font-medium">{intake.vehicleBrand || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Model</p>
                        <p className="font-medium">{intake.vehicleModel || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Loại Xe</p>
                        <p className="font-medium">{intake.vehicleType || "-"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Biển Số</p>
                        <p className="font-medium">
                            <Badge variant="outline" className="font-mono">
                                {intake.licensePlate || "N/A"}
                            </Badge>
                        </p>
                    </div>
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
                                {intake.odometer !== undefined ? intake.odometer.toLocaleString() : "-"} km
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
                                {intake.batterySoC !== undefined ? `${intake.batterySoC}%` : "-"}
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
                        <p className="font-medium">{formatDateTime(intake.updatedAt)}</p>
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
