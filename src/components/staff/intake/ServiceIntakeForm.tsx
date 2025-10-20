/**
 * Service Intake Form Component
 * Collects odometer, battery SoC, notes, and photos
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { intakeFormSchema, type IntakeFormInput } from '@/entities/schemas/intake.schema';
import type { ServiceIntake } from '@/entities/intake.types';

interface ServiceIntakeFormProps {
    intake?: ServiceIntake;
    onSubmitAction: (_data: IntakeFormInput) => Promise<void>;
    isLoading?: boolean;
    readOnly?: boolean;
}

export function ServiceIntakeForm({
    intake,
    onSubmitAction,
    isLoading = false,
    readOnly = false,
}: ServiceIntakeFormProps) {
    const [photos, setPhotos] = React.useState<string[]>(
        intake?.photos?.map((p) => p.url) ?? []
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<IntakeFormInput>({
        resolver: zodResolver(intakeFormSchema),
        defaultValues: {
            odometer: intake?.odometer ?? undefined,
            batterySoC: intake?.batterySoC ?? undefined,
            notes: intake?.notes ?? '',
            photos: photos,
        },
    });

    const handleFormSubmit = async (data: IntakeFormInput) => {
        await onSubmitAction({ ...data, photos });
    };

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // TODO: Implement actual upload to server
        // For now, create object URLs for preview
        const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
        const updatedPhotos = [...photos, ...newPhotos];
        setPhotos(updatedPhotos);
        setValue('photos', updatedPhotos);
    };

    const handleRemovePhoto = (index: number) => {
        const updatedPhotos = photos.filter((_, i) => i !== index);
        setPhotos(updatedPhotos);
        setValue('photos', updatedPhotos);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vehicle Condition & Information</CardTitle>
                <CardDescription>
                    Record the vehicle condition at check-in
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Odometer */}
                    <div className="space-y-2">
                        <Label htmlFor="odometer">
                            Odometer (km)
                            <span className="text-muted-foreground ml-1">(Optional)</span>
                        </Label>
                        <Input
                            id="odometer"
                            type="number"
                            placeholder="Enter odometer reading"
                            {...register('odometer', { valueAsNumber: true })}
                            disabled={readOnly || isLoading}
                            aria-invalid={!!errors.odometer}
                            aria-describedby={errors.odometer ? 'odometer-error' : undefined}
                        />
                        {errors.odometer && (
                            <p id="odometer-error" className="text-sm text-red-600">
                                {errors.odometer.message}
                            </p>
                        )}
                    </div>

                    {/* Battery SoC */}
                    <div className="space-y-2">
                        <Label htmlFor="batterySoC">
                            Battery State of Charge (%)
                            <span className="text-muted-foreground ml-1">(Optional)</span>
                        </Label>
                        <Input
                            id="batterySoC"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Enter battery percentage (0-100)"
                            {...register('batterySoC', { valueAsNumber: true })}
                            disabled={readOnly || isLoading}
                            aria-invalid={!!errors.batterySoC}
                            aria-describedby={errors.batterySoC ? 'battery-error' : undefined}
                        />
                        {errors.batterySoC && (
                            <p id="battery-error" className="text-sm text-red-600">
                                {errors.batterySoC.message}
                            </p>
                        )}
                    </div>

                    <Separator />

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">
                            Notes
                            <span className="text-muted-foreground ml-1">(Optional)</span>
                        </Label>
                        <textarea
                            id="notes"
                            rows={4}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Any observations about the vehicle condition..."
                            {...register('notes')}
                            disabled={readOnly || isLoading}
                            aria-invalid={!!errors.notes}
                            aria-describedby={errors.notes ? 'notes-error' : undefined}
                        />
                        {errors.notes && (
                            <p id="notes-error" className="text-sm text-red-600">
                                {errors.notes.message}
                            </p>
                        )}
                    </div>

                    {/* Photos */}
                    <div className="space-y-3">
                        <Label>Condition Photos (Optional)</Label>
                        {!readOnly && (
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoading}
                                    onClick={() => document.getElementById('photo-upload')?.click()}
                                >
                                    <ImagePlus className="w-4 h-4 mr-2" />
                                    Add Photos
                                </Button>
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                    disabled={isLoading}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
                                </span>
                            </div>
                        )}

                        {/* Photo preview grid */}
                        {photos.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                {photos.map((photo, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={photo}
                                            alt={`Condition photo ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-md border"
                                        />
                                        {!readOnly && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleRemovePhoto(index)}
                                                disabled={isLoading}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit button */}
                    {!readOnly && (
                        <>
                            <Separator />
                            <div className="flex justify-end gap-2">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : intake ? 'Update Intake' : 'Create Intake'}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
