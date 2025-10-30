/**
 * Intake Summary Card Component
 * Read-only display of completed intake information
 */

'use client';

import * as React from 'react';
import { Calendar, Gauge, Battery, FileText, Image as ImageIcon } from 'lucide-react';

import type { ServiceIntake } from '@/entities/intake.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface IntakeSummaryCardProps {
    intake: ServiceIntake;
}

export function IntakeSummaryCard({ intake }: IntakeSummaryCardProps) {
    const statusColor = intake.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Service Intake Summary</CardTitle>
                    <Badge className={statusColor}>
                        {intake.status}
                    </Badge>
                </div>
                <CardDescription>
                    Intake ID: {intake.id}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                </div>
            </CardContent>
        </Card>
    );
}
