/**
 * Queue Board - Organism Component
 * Main board tổng hợp cho Queue tab
 * Quản lý hàng chờ walk-in với drag-drop reorder
 */

import * as React from 'react';
import { RefreshCw, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Center } from '@/entities/slot.types';
import type { QueueTicket } from '@/entities/queue.types';

import { ACenterSelect } from '../atoms/ACenterSelect';
import { ADayPicker } from '../atoms/ADayPicker';
import { QueueList } from '../molecules/QueueList';

export interface QueueBoardProps {
    // Data
    centers: Center[];
    queueTickets: QueueTicket[];

    // Selected state
    selectedCenterId: string | null;
    selectedDate: string;

    // Handlers
    onCenterChange: (_centerId: string) => void;
    onDateChange: (_date: string) => void;
    onReorder: (_tickets: QueueTicket[]) => void;
    onMarkNoShow: (_ticketId: string) => void;
    onAddToQueue?: () => void;
    onRefresh?: () => void;

    // Loading states
    isLoadingCenters?: boolean;
    isLoadingQueue?: boolean;
}

export const QueueBoard: React.FC<QueueBoardProps> = ({
    centers,
    queueTickets,
    selectedCenterId,
    selectedDate,
    onCenterChange,
    onDateChange,
    onReorder,
    onMarkNoShow,
    onAddToQueue,
    onRefresh,
    isLoadingCenters = false,
    isLoadingQueue = false,
}) => {
    // Filter tickets by status (exclude NoShow and Converted)
    const activeTickets = queueTickets.filter(
        (ticket) => ticket.status === 'Waiting' || ticket.status === 'Ready'
    );

    return (
        <div className="space-y-6">
            {/* Header với Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Quản lý hàng chờ</CardTitle>
                            <CardDescription>
                                Quản lý khách hàng walk-in và sắp xếp thứ tự ưu tiên
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {onRefresh && (
                                <Button variant="outline" size="sm" onClick={onRefresh}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Làm mới
                                </Button>
                            )}
                            {onAddToQueue && (
                                <Button size="sm" onClick={onAddToQueue}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Thêm vào hàng chờ
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Center Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Trung tâm</label>
                            <ACenterSelect
                                centers={centers}
                                value={selectedCenterId || ''}
                                onChange={onCenterChange}
                                disabled={isLoadingCenters}
                            />
                        </div>

                        {/* Date Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ngày</label>
                            <ADayPicker
                                value={selectedDate}
                                onChange={onDateChange}
                            />
                        </div>
                    </div>

                    {/* Queue Stats */}
                    {selectedCenterId && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <span className="text-muted-foreground">Tổng số: </span>
                                        <span className="font-semibold text-foreground">
                                            {queueTickets.length}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Đang chờ: </span>
                                        <span className="font-semibold text-blue-600">
                                            {queueTickets.filter((t) => t.status === 'Waiting').length}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Sẵn sàng: </span>
                                        <span className="font-semibold text-green-600">
                                            {queueTickets.filter((t) => t.status === 'Ready').length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Queue List */}
            {selectedCenterId ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Hàng chờ hiện tại</CardTitle>
                        <CardDescription>
                            Kéo thả để sắp xếp thứ tự ưu tiên
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeTickets.length === 0 && !isLoadingQueue ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-10 text-center text-muted-foreground">
                                <p className="text-sm font-medium text-foreground">Chưa có khách hàng trong hàng chờ</p>
                                <p className="text-xs">
                                    Ghi nhận khách walk-in hoặc chuyển đổi booking khi khách đã đến trung tâm.
                                </p>
                                {onAddToQueue && (
                                    <Button size="sm" onClick={onAddToQueue}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm khách walk-in
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <QueueList
                                tickets={activeTickets}
                                onReorder={onReorder}
                                onMarkNoShow={onMarkNoShow}
                                isLoading={isLoadingQueue}
                            />
                        )}
                    </CardContent>
                </Card>
            ) : (
                /* No center selected */
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p>Vui lòng chọn trung tâm để xem hàng chờ</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
