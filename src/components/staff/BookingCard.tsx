"use client";

import { Clock, User, Car, MapPin, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BookingApprovalDto } from "@/entities/booking-approval.types";

interface BookingCardProps {
    booking: BookingApprovalDto;
    onAssignAction: (_booking: BookingApprovalDto) => void;
}

export function BookingCard({ booking, onAssignAction }: BookingCardProps) {
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
            case "PENDING":
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const calculateDuration = () => {
        if (!booking.preferredStartUtc || !booking.preferredEndUtc) return null;
        const start = new Date(booking.preferredStartUtc);
        const end = new Date(booking.preferredEndUtc);
        const durationMs = end.getTime() - start.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    return (
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                    {/* Left Section - Booking Info */}
                    <div className="md:col-span-3 space-y-3">
                        {/* Header */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">
                                Booking #{booking.id.slice(0, 8)}
                            </h3>
                            {getStatusBadge(booking.status)}
                            {calculateDuration() && (
                                <Badge variant="outline" className="text-xs">
                                    {calculateDuration()}
                                </Badge>
                            )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                                <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-muted-foreground">Customer ID</div>
                                    <div className="font-medium">{booking.customerId.slice(0, 8)}...</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Car className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-muted-foreground">Vehicle ID</div>
                                    <div className="font-medium">{booking.vehicleId.slice(0, 8)}...</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-muted-foreground">Start Time</div>
                                    <div className="font-medium">
                                        {formatDateTime(booking.preferredStartUtc)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-muted-foreground">End Time</div>
                                    <div className="font-medium">
                                        {formatDateTime(booking.preferredEndUtc)}
                                    </div>
                                </div>
                            </div>

                            {booking.centerId && (
                                <div className="flex items-start gap-2 md:col-span-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Service Center</div>
                                        <div className="font-medium">{booking.centerId.slice(0, 8)}...</div>
                                    </div>
                                </div>
                            )}

                            {booking.serviceTypeId && (
                                <div className="flex items-start gap-2 md:col-span-2">
                                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Service Type</div>
                                        <div className="font-medium">{booking.serviceTypeId.slice(0, 8)}...</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Approval Info */}
                        {booking.approvedBy && (
                            <div className="pt-2 border-t">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>
                                        Approved by <span className="font-medium">{booking.approvedBy.slice(0, 8)}</span>
                                        {booking.approvedAt && (
                                            <> at {formatDateTime(booking.approvedAt)}</>
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Created At */}
                        {booking.createdAt && (
                            <div className="text-xs text-muted-foreground">
                                Created: {formatDateTime(booking.createdAt)}
                            </div>
                        )}
                    </div>

                    {/* Right Section - Actions */}
                    <div className="md:col-span-2 flex flex-col gap-2 md:items-end">
                        <Button
                            onClick={() => onAssignAction(booking)}
                            className="w-full md:w-auto"
                            size="lg"
                        >
                            Assign to Technician
                        </Button>

                        <div className="text-xs text-muted-foreground md:text-right">
                            Ready for assignment
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
