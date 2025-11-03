/**
 * Intake Summary Card Component
 * Read-only display of completed intake information
 */

'use client';

import * as React from 'react';
import { Calendar, Gauge, Battery, FileText, Image as ImageIcon, Car, Users } from 'lucide-react';

import type { ServiceIntake, IntakeStatus } from '@/entities/intake.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface IntakeSummaryCardProps {
    intake: ServiceIntake;
}

const statusClasses: Record<IntakeStatus, string> = {
    Checked_In: 'bg-blue-100 text-blue-800',
    Inspecting: 'bg-yellow-100 text-yellow-800',
    Verified: 'bg-purple-100 text-purple-800',
    Finalized: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<IntakeStatus, string> = {
    Checked_In: 'Checked-In',
    Inspecting: 'Inspecting',
    Verified: 'Verified',
    Finalized: 'Finalized',
    Cancelled: 'Cancelled',
};

export function IntakeSummaryCard({ intake }: IntakeSummaryCardProps) {
    const statusColor = statusClasses[intake.status] ?? 'bg-gray-100 text-gray-700';

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Service Intake Summary</CardTitle>
                    <Badge className={statusColor}>
                        {statusLabels[intake.status] ?? intake.status}
                    </Badge>
                </div>
                <CardDescription>
                    Intake ID: {intake.id}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Customer Info */}
                {(intake.customerName || intake.customerPhone || intake.customerEmail) && (
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Khách hàng</p>
                            <p className="text-sm text-muted-foreground">
                                {intake.customerName ?? 'Khách vãng lai'}
                                {intake.customerPhone ? ` • ${intake.customerPhone}` : ''}
                            </p>
                            {intake.customerEmail && (
                                <p className="text-xs text-muted-foreground">{intake.customerEmail}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Vehicle Info */}
                {(intake.vehicleBrand || intake.vehicleType || intake.licensePlate) && (
                    <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Phương tiện</p>
                            <p className="text-sm text-muted-foreground">
                                {[intake.vehicleBrand, intake.vehicleType].filter(Boolean).join(' • ') || 'Chưa cập nhật'}
                            </p>
                            {intake.licensePlate && (
                                <p className="text-xs text-muted-foreground uppercase">
                                    Biển số: {intake.licensePlate}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Odometer */}
                {intake.odometer && (
                    <div className="flex items-center gap-3">
                        <Gauge className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Odometer</p>
                            <p className="text-sm text-muted-foreground">{intake.odometer.toLocaleString()} km</p>
                        </div>
                    </div>
                )}

                {/* Battery SoC */}
                {intake.batterySoC !== undefined && intake.batterySoC !== null && (
                    <div className="flex items-center gap-3">
                        <Battery className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Battery State of Charge</p>
                            <p className="text-sm text-muted-foreground">{intake.batterySoC}%</p>
                        </div>
                    </div>
                )}

                {/* Arrival Notes */}
                {intake.arrivalNotes && (
                    <>
                        <Separator />
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium mb-1">Ghi chú tiếp nhận</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{intake.arrivalNotes}</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Notes */}
                {intake.notes && (
                    <>
                        <Separator />
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium mb-1">Notes</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{intake.notes}</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Photos */}
                {intake.photos && intake.photos.length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                    Condition Photos ({intake.photos.length})
                                </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {intake.photos.map((photo) => (
                                    <img
                                        key={photo.id}
                                        src={photo.url}
                                        alt={photo.name}
                                        className="w-full h-32 object-cover rounded-md border"
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Timestamps */}
                <Separator />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(intake.createdAt).toLocaleString()}</span>
                    {intake.updatedAt && (
                        <span>• Updated: {new Date(intake.updatedAt).toLocaleString()}</span>
                    )}
                    {intake.verifiedAt && (
                        <span>
                            • Verified: {new Date(intake.verifiedAt).toLocaleString()}
                            {intake.verifiedBy && ` bởi ${intake.verifiedBy}`}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
