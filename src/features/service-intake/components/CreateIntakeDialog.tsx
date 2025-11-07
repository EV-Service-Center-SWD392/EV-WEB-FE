/**
 * CreateIntakeDialog Component
 * Reusable dialog for creating intake from booking
 * Updated to match API spec: http://localhost:5020/api/ServiceIntake
 */

"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import type { ServiceIntake } from "@/entities/intake.types";
import { useCreateIntake } from "@/hooks/intake/useIntake";

// Type matching Supabase booking structure from ApprovedBookingsList
interface BookingData {
    bookingid: string; // Supabase uses lowercase
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    licensePlate?: string;
    status: string;
}

interface CreateIntakeDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    booking: BookingData | null;
    onSuccess?: (_intake: ServiceIntake) => void;
}

export function CreateIntakeDialog({
    open,
    onOpenChange,
    booking,
    onSuccess,
}: CreateIntakeDialogProps) {
    const createIntakeMutation = useCreateIntake();
    const [formData, setFormData] = React.useState({
        odometer: "",
        batteryPercent: "",
    });

    // Reset form when dialog opens/closes or booking changes
    React.useEffect(() => {
        if (open && booking) {
            setFormData({
                odometer: "",
                batteryPercent: "",
            });
        }
    }, [open, booking]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!booking) {
            toast.error("Không có thông tin booking");
            return;
        }

        // Validation
        const odometerValue = formData.odometer ? parseInt(formData.odometer, 10) : null;
        const batteryValue = formData.batteryPercent ? parseInt(formData.batteryPercent, 10) : null;

        if (odometerValue !== null && odometerValue < 0) {
            toast.error("Vui lòng nhập số km hợp lệ (>= 0)");
            return;
        }

        if (batteryValue !== null && (batteryValue < 0 || batteryValue > 100)) {
            toast.error("Vui lòng nhập mức pin từ 0-100%");
            return;
        }

        try {
            // Map Supabase field (bookingid) to API field (bookingId)
            const intake = await createIntakeMutation.mutateAsync({
                bookingId: booking.bookingid, // Supabase uses lowercase, API expects camelCase
                odometer: odometerValue,
                batteryPercent: batteryValue,
            });

            onOpenChange(false);
            onSuccess?.(intake);
        } catch (error) {
            // Error is handled by the hook
            console.error("Failed to create intake:", error);
        }
    };

    if (!booking) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white">
                <DialogHeader>
                    <DialogTitle>Tạo Service Intake</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin xe khi khách hàng đến trung tâm
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[70vh] overflow-y-auto pr-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Booking Info */}
                        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                            <h3 className="text-sm font-semibold">Thông tin Booking</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Khách hàng:</span>
                                    <span className="text-sm font-medium">
                                        {booking.customerName || "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Điện thoại:</span>
                                    <span className="text-sm font-medium">
                                        {booking.customerPhone || "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Xe:</span>
                                    <span className="text-sm font-medium">
                                        {booking.vehicleBrand && booking.vehicleModel
                                            ? `${booking.vehicleBrand} ${booking.vehicleModel}`
                                            : "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Trạng thái:</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        {booking.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Inspection Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Kiểm Tra Khi Xe Đến</h3>

                            {/* Odometer and Battery in same row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="odometer">
                                        Số Km (Odometer) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="odometer"
                                        type="number"
                                        placeholder="VD: 12345"
                                        value={formData.odometer}
                                        onChange={(e) => handleInputChange("odometer", e.target.value)}
                                        required
                                        min="0"
                                        className="bg-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="batteryPercent">
                                        Mức Pin (%) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="batteryPercent"
                                        type="number"
                                        placeholder="VD: 75"
                                        min="0"
                                        max="100"
                                        value={formData.batteryPercent}
                                        onChange={(e) => handleInputChange("batteryPercent", e.target.value)}
                                        required
                                        className="bg-white"
                                    />
                                </div>
                            </div>

                            {/* Notes - Removed as it's not in the API spec */}
                            <div className="text-sm text-muted-foreground">
                                <p>💡 Tip: Odometer và Battery Percent là thông tin tùy chọn</p>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={createIntakeMutation.isPending}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={createIntakeMutation.isPending}>
                                {createIntakeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tạo Service Intake
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
