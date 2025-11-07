/**
 * Service Intake Form Component
 * Collects odometer, battery SoC, notes, and photos
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { intakeFormSchema, type IntakeFormInput } from '@/entities/schemas/intake.schema';
import type { ServiceIntake } from '@/entities/intake.types';
import { uploadIntakePhoto } from '@/services/intakeService';

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
    const [isUploadingPhotos, setIsUploadingPhotos] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<IntakeFormInput>({
        resolver: zodResolver(intakeFormSchema),
        defaultValues: {
            licensePlate: intake?.licensePlate ?? '',
            odometer: intake?.odometer ?? undefined,
            batterySoC: intake?.batteryPercent ?? undefined,
            arrivalNotes: intake?.arrivalNotes ?? '',
            notes: intake?.notes ?? '',
            photos: photos,
        },
    });

    const handleFormSubmit = async (data: IntakeFormInput) => {
        await onSubmitAction({ ...data, photos });
    };

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploadingPhotos(true);
        try {
            const uploadedUrls = await Promise.all(Array.from(files).map((file) => uploadIntakePhoto(file)));
            const updatedPhotos = [...photos, ...uploadedUrls];
            setPhotos(updatedPhotos);
            setValue('photos', updatedPhotos);
        } catch (error) {
            console.error('Upload intake photos failed', error);
            toast.error('Không thể tải ảnh lên, vui lòng thử lại.');
        } finally {
            setIsUploadingPhotos(false);
            event.target.value = '';
        }
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
                    {/* License Plate */}
                    <div className="space-y-2">
                        <Label htmlFor="licensePlate">
                            Biển số xe <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="licensePlate"
                            placeholder="VD: 51A-12345"
                            {...register('licensePlate')}
                            disabled={readOnly || isLoading}
                            aria-invalid={!!errors.licensePlate}
                            aria-describedby={errors.licensePlate ? 'license-error' : undefined}
                        />
                        {errors.licensePlate && (
                            <p id="license-error" className="text-sm text-red-600">
                                {errors.licensePlate.message as string}
                            </p>
                        )}
                    </div>
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

                    {/* Arrival Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="arrivalNotes">
                            Ghi chú khi tiếp nhận
                            <span className="text-muted-foreground ml-1">(Optional)</span>
                        </Label>
                        <textarea
                            id="arrivalNotes"
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Ví dụ: khách báo xe có cảnh báo pin, xuất hiện tiếng ồn nhỏ..."
                            {...register('arrivalNotes')}
                            disabled={readOnly || isLoading}
                            aria-invalid={!!errors.arrivalNotes}
                            aria-describedby={errors.arrivalNotes ? 'arrival-error' : undefined}
                        />
                        {errors.arrivalNotes && (
                            <p id="arrival-error" className="text-sm text-red-600">
                                {errors.arrivalNotes.message as string}
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
                                    disabled={isLoading || isUploadingPhotos}
                                    onClick={() => document.getElementById('photo-upload')?.click()}
                                >
                                    {isUploadingPhotos ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang tải ảnh...
                                        </>
                                    ) : (
                                        <>
                                            <ImagePlus className="w-4 h-4 mr-2" />
                                            Thêm ảnh
                                        </>
                                    )}
                                </Button>
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                    disabled={isLoading || isUploadingPhotos}
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
