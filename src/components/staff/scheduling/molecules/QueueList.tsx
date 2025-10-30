/**
 * Queue List - Molecule Component
 * Danh sách hàng chờ với drag-drop để sắp xếp ưu tiên
 */

import * as React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, User, Clock, X, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { QueueTicket } from '@/entities/queue.types';

export interface QueueListProps {
    tickets: QueueTicket[];
    onReorder: (_tickets: QueueTicket[]) => void;
    onMarkNoShow: (_ticketId: string) => void;
    onUpdateEta?: (_ticketId: string, _eta: string) => void;
    isLoading?: boolean;
    className?: string;
}

// Sortable Item Component
interface SortableItemProps {
    ticket: QueueTicket;
    onMarkNoShow: (_ticketId: string) => void;
}

function SortableItem({ ticket, onMarkNoShow }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: ticket.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getPriorityBadge = (priority: number) => {
        switch (priority) {
            case 1:
                return (
                    <Badge variant="destructive" className="text-xs">
                        Cao
                    </Badge>
                );
            case 2:
                return (
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                        Trung bình
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-xs">
                        Thấp
                    </Badge>
                );
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Waiting':
                return (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        Đang chờ
                    </Badge>
                );
            case 'Ready':
                return (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        Sẵn sàng
                    </Badge>
                );
            case 'NoShow':
                return (
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
                        Vắng mặt
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="text-xs">{status}</Badge>;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'p-4 bg-card border rounded-lg transition-all duration-200',
                isDragging ? 'opacity-50 shadow-lg scale-105' : 'hover:shadow-md'
            )}
        >
            <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <button
                    className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-5 h-5" />
                </button>

                {/* Queue Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {ticket.queueNo}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header: Service Request ID & Priority */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">
                            #{ticket.serviceRequestId}
                        </span>
                        {getPriorityBadge(ticket.priority || 2)}
                        {getStatusBadge(ticket.status)}
                    </div>

                    {/* Customer Info (if available from detail) */}
                    <div className="space-y-1 mb-2">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Khách hàng walk-in</span>
                        </div>
                    </div>

                    {/* ETA */}
                    {ticket.estimatedStartUtc && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                                Ước tính: {new Date(ticket.estimatedStartUtc).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onMarkNoShow(ticket.id)}
                        title="Đánh dấu vắng mặt"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export const QueueList: React.FC<QueueListProps> = ({
    tickets,
    onReorder,
    onMarkNoShow,
    isLoading = false,
    className,
}) => {
    const [items, setItems] = React.useState(tickets);

    React.useEffect(() => {
        setItems(tickets);
    }, [tickets]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(items, oldIndex, newIndex);
            // Update queue numbers
            const reorderedItems = newItems.map((item, index) => ({
                ...item,
                queueNo: index + 1,
            }));

            setItems(reorderedItems);
            onReorder(reorderedItems);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse bg-muted/50 h-24" />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Hàng chờ trống</p>
                <p className="text-xs mt-1">Chưa có khách hàng walk-in nào</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-3', className)}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    {items.map((ticket) => (
                        <SortableItem
                            key={ticket.id}
                            ticket={ticket}
                            onMarkNoShow={onMarkNoShow}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};
