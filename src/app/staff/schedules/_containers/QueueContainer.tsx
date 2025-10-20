/**
 * Queue Container
 * Orchestrates business logic for Queue tab
 * Connects hooks, services, and QueueBoard organism
 */

'use client';

import * as React from 'react';
import { toast } from 'sonner';

import type { QueueTicket } from '@/entities/queue.types';

import { QueueBoard } from '@/components/staff/scheduling/organisms/QueueBoard';
import {
    useCenters,
    useQueue,
    useReorderQueue,
    useMarkNoShow,
    useScheduleParams,
} from '@/hooks/scheduling';

export const QueueContainer: React.FC = () => {
    // State from Zustand store
    const { centerId, selectedDate, setCenterId, setSelectedDate } =
        useScheduleParams();

    // Data hooks
    const { data: centers = [], isLoading: isLoadingCenters } = useCenters();
    const { data: queueTickets = [], isLoading: isLoadingQueue } = useQueue({
        centerId: centerId || '',
        date: selectedDate,
    });

    // Mutations
    const reorderQueue = useReorderQueue();
    const markNoShow = useMarkNoShow();

    // Handlers
    const handleCenterChange = (newCenterId: string) => {
        setCenterId(newCenterId);
    };

    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
    };

    const handleReorder = async (reorderedTickets: QueueTicket[]) => {
        if (!centerId) return;

        try {
            const ticketIds = reorderedTickets.map((t) => t.id);
            await reorderQueue.mutateAsync({
                centerId,
                date: selectedDate,
                dto: { ticketIds },
            });
            toast.success('Đã cập nhật thứ tự hàng chờ');
        } catch (error) {
            toast.error('Lỗi khi sắp xếp hàng chờ');
            console.error('Reorder error:', error);
        }
    };

    const handleMarkNoShow = async (ticketId: string) => {
        try {
            await markNoShow.mutateAsync(ticketId);
            toast.success('Đã đánh dấu vắng mặt');
        } catch (error) {
            toast.error('Lỗi khi đánh dấu vắng mặt');
            console.error('Mark no-show error:', error);
        }
    };

    const handleAddToQueue = () => {
        // TODO: Open modal to add service request to queue
        toast.info('Tính năng đang phát triển');
    };

    const handleRefresh = () => {
        toast.info('Đang làm mới dữ liệu...');
    };

    return (
        <QueueBoard
            centers={centers}
            queueTickets={queueTickets}
            selectedCenterId={centerId}
            selectedDate={selectedDate}
            onCenterChange={handleCenterChange}
            onDateChange={handleDateChange}
            onReorder={handleReorder}
            onMarkNoShow={handleMarkNoShow}
            onAddToQueue={handleAddToQueue}
            onRefresh={handleRefresh}
            isLoadingCenters={isLoadingCenters}
            isLoadingQueue={isLoadingQueue}
        />
    );
};
