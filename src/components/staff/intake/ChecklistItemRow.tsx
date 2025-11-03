/**
 * Checklist Item Row Component
 * Renders appropriate input based on item type (Bool/Number/Text)
 */

'use client';

import * as React from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { ChecklistItem, ChecklistResponse, SeverityLevel } from '@/entities/intake.types';
import { uploadChecklistPhoto } from '@/services/intakeService';

interface ChecklistItemRowProps {
    item: ChecklistItem;
    response?: ChecklistResponse;
    onChangeAction: (_response: Partial<ChecklistResponse>) => void;
    readOnly?: boolean;
}

export function ChecklistItemRow({
    item,
    response,
    onChangeAction,
    readOnly = false,
}: ChecklistItemRowProps) {
    const [photoUrl, setPhotoUrl] = React.useState(response?.photoUrl ?? '');
    const [note, setNote] = React.useState(response?.note ?? '');
    const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);

    const handleValueChange = (value: boolean | number | string | undefined) => {
        const update: Partial<ChecklistResponse> = {
            checklistItemId: item.id,
        };

        switch (item.type) {
            case 'Bool':
                update.boolValue = value as boolean;
                break;
            case 'Number':
                update.numberValue = value as number;
                break;
            case 'Text':
                update.textValue = value as string;
                break;
        }

        onChangeAction({ ...update, note, photoUrl });
    };

    const handleSeverityChange = (severity: SeverityLevel) => {
        onChangeAction({
            ...response,
            checklistItemId: item.id,
            severity,
            note,
            photoUrl,
        });
    };

    const handleNoteChange = (newNote: string) => {
        setNote(newNote);
        onChangeAction({
            ...response,
            checklistItemId: item.id,
            note: newNote,
            photoUrl,
        });
    };

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingPhoto(true);
        try {
            const remoteUrl = await uploadChecklistPhoto(file);
            setPhotoUrl(remoteUrl);
            onChangeAction({
                ...response,
                checklistItemId: item.id,
                photoUrl: remoteUrl,
                note,
            });
        } catch (error) {
            console.error('Upload checklist photo failed', error);
            toast.error('Không thể tải ảnh checklist, vui lòng thử lại.');
        } finally {
            setIsUploadingPhoto(false);
            event.target.value = '';
        }
    };

    const handleRemovePhoto = () => {
        setPhotoUrl('');
        onChangeAction({
            ...response,
            checklistItemId: item.id,
            photoUrl: '',
            note,
        });
    };

    const renderValueInput = () => {
        switch (item.type) {
            case 'Bool':
                return (
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            variant={response?.boolValue === true ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleValueChange(true)}
                            disabled={readOnly}
                        >
                            Pass
                        </Button>
                        <Button
                            type="button"
                            variant={response?.boolValue === false ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => handleValueChange(false)}
                            disabled={readOnly}
                        >
                            Fail
                        </Button>
                    </div>
                );

            case 'Number':
                return (
                    <Input
                        type="number"
                        placeholder="Enter value"
                        value={response?.numberValue ?? ''}
                        onChange={(e) => handleValueChange(parseFloat(e.target.value) || undefined)}
                        disabled={readOnly}
                        className="max-w-xs"
                    />
                );

            case 'Text':
                return (
                    <textarea
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter details"
                        value={response?.textValue ?? ''}
                        onChange={(e) => handleValueChange(e.target.value)}
                        disabled={readOnly}
                        rows={2}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="border rounded-lg p-4 space-y-4">
            {/* Item label and required badge */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <Label className="text-base font-medium">
                        {item.label}
                        {item.isRequired && (
                            <Badge variant="outline" className="ml-2 text-xs">
                                Required
                            </Badge>
                        )}
                    </Label>
                    {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                </div>
            </div>

            {/* Value input */}
            <div className="space-y-2">
                <Label className="text-sm">Response</Label>
                {renderValueInput()}
            </div>

            {/* Severity selector */}
            {(response?.boolValue === false || response?.numberValue || response?.textValue) && (
                <div className="space-y-2">
                    <Label className="text-sm">Severity</Label>
                    <Select
                        value={response?.severity ?? 'Low'}
                        onValueChange={(value) => handleSeverityChange(value as SeverityLevel)}
                        disabled={readOnly}
                    >
                        <SelectTrigger className="max-w-xs">
                            <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Additional note */}
            <div className="space-y-2">
                <Label className="text-sm">Additional Notes (Optional)</Label>
                <Input
                    placeholder="Add any relevant notes..."
                    value={note}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    disabled={readOnly}
                />
            </div>

            {/* Photo attachment */}
            <div className="space-y-2">
                <Label className="text-sm">Photo Evidence (Optional)</Label>
                {!readOnly && !photoUrl && (
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`photo-${item.id}`)?.click()}
                            disabled={isUploadingPhoto}
                        >
                            {isUploadingPhoto ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang tải ảnh...
                                </>
                            ) : (
                                <>
                                    <ImagePlus className="w-4 h-4 mr-2" />
                                    Đính kèm ảnh
                                </>
                            )}
                        </Button>
                        <input
                            id={`photo-${item.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                            disabled={isUploadingPhoto}
                        />
                    </div>
                )}
                {photoUrl && (
                    <div className="relative inline-block">
                        <img
                            src={photoUrl}
                            alt={`Photo for ${item.label}`}
                            className="w-32 h-32 object-cover rounded-md border"
                        />
                        {!readOnly && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={handleRemovePhoto}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
