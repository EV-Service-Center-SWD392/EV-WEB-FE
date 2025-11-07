/**
 * ChecklistEditor Component
 * Allows technician to fill out checklist responses
 * Supports: Bool, Number, Text values, Severity, Notes, Photo upload
 */

'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Upload, X, CheckCircle2, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { checklistService } from '@/services/checklistService';
import type {
    ChecklistItem,
    ChecklistResponse,
    SeverityLevel,
    ChecklistCategory,
} from '@/entities/intake.types';

interface ChecklistEditorProps {
    intakeId: string;
    onSave?: () => void;
    readOnly?: boolean;
}

export function ChecklistEditor({ intakeId, onSave, readOnly = false }: ChecklistEditorProps) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [items, setItems] = React.useState<ChecklistItem[]>([]);
    const [responses, setResponses] = React.useState<Map<string, ChecklistResponse>>(new Map());
    const [uploadingPhotos, setUploadingPhotos] = React.useState<Set<string>>(new Set());

    // Load checklist items and existing responses
    const loadChecklist = React.useCallback(async () => {
        try {
            setIsLoading(true);

            const [catalogItems, existingResponses] = await Promise.all([
                checklistService.getChecklistItems(),
                checklistService.getChecklistResponses(intakeId),
            ]);

            setItems(catalogItems.filter((item) => item.isActive));

            // Convert existing responses to map
            const responseMap = new Map<string, ChecklistResponse>();
            existingResponses.forEach((response) => {
                responseMap.set(response.checklistItemId, response);
            });
            setResponses(responseMap);
        } catch (error) {
            console.error('Failed to load checklist:', error);
            toast.error('Không thể tải danh sách kiểm tra');
        } finally {
            setIsLoading(false);
        }
    }, [intakeId]);

    React.useEffect(() => {
        loadChecklist();
    }, [loadChecklist]);

    const updateResponse = (itemId: string, update: Partial<ChecklistResponse>) => {
        setResponses((prev) => {
            const newMap = new Map(prev);
            const existing = newMap.get(itemId) || { checklistItemId: itemId };
            newMap.set(itemId, { ...existing, ...update });
            return newMap;
        });
    };

    const handlePhotoUpload = async (itemId: string, file: File) => {
        try {
            setUploadingPhotos((prev) => new Set(prev).add(itemId));

            const photoUrl = await checklistService.uploadChecklistPhoto(intakeId, itemId, file);

            updateResponse(itemId, { photoUrl });
            toast.success('Đã tải ảnh lên thành công');
        } catch (error) {
            console.error('Failed to upload photo:', error);
            toast.error('Không thể tải ảnh lên');
        } finally {
            setUploadingPhotos((prev) => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            const responsesArray = Array.from(responses.values()).filter(
                (response) =>
                    response.boolValue !== undefined ||
                    response.numberValue !== undefined ||
                    response.textValue !== undefined
            );

            await checklistService.saveChecklistResponses(intakeId, {
                responses: responsesArray,
            });

            toast.success('Đã lưu checklist thành công');
            onSave?.();
        } catch (error) {
            console.error('Failed to save checklist:', error);
            toast.error('Không thể lưu checklist');
        } finally {
            setIsSaving(false);
        }
    };

    const getCategoryIcon = (_category: ChecklistCategory) => {
        // Could add different icons per category
        return <CheckCircle2 className="w-5 h-5" />;
    };

    const getSeverityBadge = (severity?: SeverityLevel) => {
        if (!severity) return null;

        const variants = {
            Low: { variant: 'secondary' as const, label: 'Thấp' },
            Medium: { variant: 'default' as const, label: 'Trung bình' },
            High: { variant: 'destructive' as const, label: 'Cao' },
        };

        const config = variants[severity];
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<ChecklistCategory, ChecklistItem[]>);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Đang tải checklist...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Category groups */}
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <Card key={category}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {getCategoryIcon(category as ChecklistCategory)}
                            {category}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {categoryItems.map((item) => {
                            const response = responses.get(item.id);

                            return (
                                <div
                                    key={item.id}
                                    className="border rounded-lg p-4 space-y-4"
                                >
                                    {/* Item Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-base font-medium">
                                                    {item.label}
                                                    {item.isRequired && (
                                                        <span className="text-destructive ml-1">*</span>
                                                    )}
                                                </Label>
                                            </div>
                                            {item.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                        {response?.severity && getSeverityBadge(response.severity)}
                                    </div>

                                    {/* Value Input */}
                                    <div className="space-y-3">
                                        {item.type === 'Bool' && (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`bool-${item.id}`}
                                                    checked={response?.boolValue || false}
                                                    onChange={(e) =>
                                                        !readOnly &&
                                                        updateResponse(item.id, {
                                                            boolValue: e.target.checked,
                                                        })
                                                    }
                                                    disabled={readOnly}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <Label htmlFor={`bool-${item.id}`}>
                                                    {response?.boolValue ? 'Đạt' : 'Không đạt'}
                                                </Label>
                                            </div>
                                        )}

                                        {item.type === 'Number' && (
                                            <Input
                                                type="number"
                                                placeholder="Nhập giá trị số"
                                                value={response?.numberValue || ''}
                                                onChange={(e) =>
                                                    !readOnly &&
                                                    updateResponse(item.id, {
                                                        numberValue: e.target.value
                                                            ? Number(e.target.value)
                                                            : undefined,
                                                    })
                                                }
                                                disabled={readOnly}
                                            />
                                        )}

                                        {item.type === 'Text' && (
                                            <Textarea
                                                placeholder="Nhập thông tin chi tiết"
                                                rows={2}
                                                value={response?.textValue || ''}
                                                onChange={(e) =>
                                                    !readOnly &&
                                                    updateResponse(item.id, {
                                                        textValue: e.target.value,
                                                    })
                                                }
                                                disabled={readOnly}
                                            />
                                        )}

                                        {/* Severity */}
                                        {!readOnly && (
                                            <div className="space-y-2">
                                                <Label htmlFor={`severity-${item.id}`}>
                                                    Mức độ nghiêm trọng
                                                </Label>
                                                <Select
                                                    value={response?.severity || ''}
                                                    onValueChange={(value) =>
                                                        updateResponse(item.id, {
                                                            severity: value as SeverityLevel,
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger id={`severity-${item.id}`}>
                                                        <SelectValue placeholder="Chọn mức độ" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Low">Thấp</SelectItem>
                                                        <SelectItem value="Medium">Trung bình</SelectItem>
                                                        <SelectItem value="High">Cao</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Note */}
                                        <div className="space-y-2">
                                            <Label htmlFor={`note-${item.id}`}>Ghi chú</Label>
                                            <Textarea
                                                id={`note-${item.id}`}
                                                placeholder="Thêm ghi chú chi tiết..."
                                                rows={2}
                                                value={response?.note || ''}
                                                onChange={(e) =>
                                                    !readOnly &&
                                                    updateResponse(item.id, {
                                                        note: e.target.value,
                                                    })
                                                }
                                                disabled={readOnly}
                                            />
                                        </div>

                                        {/* Photo Upload */}
                                        {!readOnly && (
                                            <div className="space-y-2">
                                                <Label>Hình ảnh</Label>
                                                <div className="flex items-center gap-3">
                                                    {response?.photoUrl ? (
                                                        <div className="relative">
                                                            <img
                                                                src={response.photoUrl}
                                                                alt="Checklist item"
                                                                className="w-24 h-24 object-cover rounded border"
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                className="absolute -top-2 -right-2 h-6 w-6"
                                                                onClick={() =>
                                                                    updateResponse(item.id, {
                                                                        photoUrl: undefined,
                                                                    })
                                                                }
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <label className="cursor-pointer">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        handlePhotoUpload(item.id, file);
                                                                    }
                                                                }}
                                                                disabled={uploadingPhotos.has(item.id)}
                                                            />
                                                            <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
                                                                <Upload className="w-4 h-4" />
                                                                <span className="text-sm">
                                                                    {uploadingPhotos.has(item.id)
                                                                        ? 'Đang tải...'
                                                                        : 'Tải ảnh lên'}
                                                                </span>
                                                            </div>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {readOnly && response?.photoUrl && (
                                            <div>
                                                <img
                                                    src={response.photoUrl}
                                                    alt="Checklist item"
                                                    className="w-32 h-32 object-cover rounded border"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            ))}

            {/* Save Button */}
            {!readOnly && (
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Info className="w-4 h-4" />
                        <span>
                            Lưu checklist sẽ tự động cập nhật trạng thái phiếu tiếp nhận
                        </span>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving} size="lg">
                        {isSaving ? 'Đang lưu...' : 'Lưu Checklist'}
                    </Button>
                </div>
            )}
        </div>
    );
}
