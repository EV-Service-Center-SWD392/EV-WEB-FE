/**
 * Vehicle Picker Molecule
 * Allows selecting from customer's vehicles or creating a new one
 */

'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/features/service-request/types/domain';

export interface VehiclePickerProps {
    vehicles: Vehicle[];
    isLoading?: boolean;
    error?: string | null;
    selectedVehicle?: Vehicle | null;
    onSelectVehicle: (_vehicle: Vehicle | null) => void;
    onCreateNew?: () => void;
    disabled?: boolean;
    label?: string;
}

export const VehiclePicker: React.FC<VehiclePickerProps> = ({
    vehicles,
    isLoading,
    error,
    selectedVehicle,
    onSelectVehicle,
    onCreateNew,
    disabled,
    label = 'Vehicle (Optional)',
}) => {
    return (
        <div className="space-y-2">
            <Label className={cn(error && 'text-destructive', disabled && 'opacity-50')}>
                {label}
            </Label>

            {disabled && (
                <p className="text-sm text-muted-foreground">Select a customer first</p>
            )}

            {!disabled && (
                <>
                    {isLoading && (
                        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                            Loading vehicles...
                        </div>
                    )}

                    {!isLoading && vehicles.length === 0 && (
                        <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-2">No vehicles found</p>
                            {onCreateNew && (
                                <Button type="button" variant="outline" size="sm" onClick={onCreateNew}>
                                    + Add Vehicle
                                </Button>
                            )}
                        </div>
                    )}

                    {!isLoading && vehicles.length > 0 && (
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                                {vehicles.map((vehicle) => (
                                    <Card
                                        key={vehicle.id}
                                        className={cn(
                                            'p-3 cursor-pointer transition-all hover:border-primary',
                                            selectedVehicle?.id === vehicle.id &&
                                            'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                                        )}
                                        onClick={() => onSelectVehicle(vehicle)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                onSelectVehicle(vehicle);
                                            }
                                        }}
                                    >
                                        <p className="font-medium">
                                            {vehicle.brand && vehicle.model
                                                ? `${vehicle.brand} ${vehicle.model}`
                                                : 'Unknown Vehicle'}
                                            {vehicle.year && ` (${vehicle.year})`}
                                        </p>
                                        {vehicle.licensePlate && (
                                            <p className="text-sm text-muted-foreground">
                                                Plate: {vehicle.licensePlate}
                                            </p>
                                        )}
                                    </Card>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onSelectVehicle(null)}
                                    disabled={!selectedVehicle}
                                >
                                    Clear Selection
                                </Button>
                                {onCreateNew && (
                                    <Button type="button" variant="outline" size="sm" onClick={onCreateNew}>
                                        + Add New Vehicle
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {error && (
                <p className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

VehiclePicker.displayName = 'VehiclePicker';
