/**
 * CreateIntakeDialog Component
 * Reusable dialog for creating intake from booking
 */

"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { createIntake } from "@/services/intakeService";
import type { ServiceIntake } from "@/entities/intake.types";

interface BookingData {
    bookingid: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    vehicleBrand: string;
    vehicleModel: string;
    licensePlate: string;
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
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [formData, setFormData] = React.useState({
        licensePlate: "",
        odometer: "",
        batterySoC: "",
        arrivalNotes: "",
        notes: "",
    });

    // Reset form when dialog opens/closes or booking changes
    React.useEffect(() => {
        if (open && booking) {
            setFormData({
                licensePlate: booking.licensePlate || "",
                odometer: "",
                batterySoC: "",
                arrivalNotes: "",
                notes: "",
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

        try {
            setIsSubmitting(true);

            const intake = await createIntake(booking.bookingid, {
                licensePlate: formData.licensePlate || undefined,
                odometer: formData.odometer ? parseInt(formData.odometer, 10) : undefined,
                batterySoC: formData.batterySoC ? parseInt(formData.batterySoC, 10) : undefined,
                arrivalNotes: formData.arrivalNotes || undefined,
                notes: formData.notes || undefined,
            });

            toast.success("Service Intake đã tạo thành công!");
            onOpenChange(false);
            onSuccess?.(intake);
        } catch (error) {
            console.error("Failed to create intake:", error);
            toast.error((error as Error).message || "Không thể tạo intake");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!booking) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tạo Service Intake</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin xe khi khách hàng đến trung tâm
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Booking Info */}
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                        <p className="text-sm font-medium">Thông tin Booking</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Khách hàng:</span>{" "}
                                <span className="font-medium">{booking.customerName}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Điện thoại:</span>{" "}
                                <span className="font-medium">{booking.customerPhone}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Xe:</span>{" "}
                                <span className="font-medium">{booking.vehicleBrand} {booking.vehicleModel}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Trạng thái:</span>{" "}
                                <Badge variant="outline" className="ml-1">{booking.status}</Badge>
                            </div>
                        </div>
                    </div>

                    {/* License Plate */}
                    <div className="space-y-2">
                        <Label htmlFor="licensePlate">Biển Số Xe</Label>
                        <Input
                            id="licensePlate"
                            placeholder="VD: 30A-12345"
                            value={formData.licensePlate}
                            onChange={(e) => handleInputChange("licensePlate", e.target.value)}
                        />
                    </div>

                    {/* Odometer */}
                    <div className="space-y-2">
                        <Label htmlFor="odometer">Số Km (Odometer)</Label>
                        <Input
                            id="odometer"
                            type="number"
                            placeholder="VD: 12345"
                            value={formData.odometer}
                            onChange={(e) => handleInputChange("odometer", e.target.value)}
                        />
                    </div>

                    {/* Battery SoC */}
                    <div className="space-y-2">
                        <Label htmlFor="batterySoC">Mức Pin (%)</Label>
                        <Input
                            id="batterySoC"
                            type="number"
                            placeholder="VD: 75"
                            min="0"
                            max="100"
                            value={formData.batterySoC}
                            onChange={(e) => handleInputChange("batterySoC", e.target.value)}
                        />
                    </div>

                    {/* Arrival Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="arrivalNotes">Ghi Chú Khi Đến</Label>
                        <Textarea
                            id="arrivalNotes"
                            placeholder="Ghi chú về tình trạng xe..."
                            rows={3}
                            value={formData.arrivalNotes}
                            onChange={(e) => handleInputChange("arrivalNotes", e.target.value)}
                        />
                    </div>

                    {/* General Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Ghi Chú Chung</Label>
                        <Textarea
                            id="notes"
                            placeholder="Ghi chú khác..."
                            rows={2}
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Tạo Service Intake
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
