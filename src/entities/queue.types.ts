export type UUID = string;

export type QueueStatus = 'Waiting' | 'Ready' | 'NoShow' | 'Converted';

export interface QueueTicket {
    id: UUID;
    centerId: UUID;
    serviceRequestId: UUID;     // tham chiếu request intake
    queueNo: number;
    priority?: number;          // số nhỏ = ưu tiên cao
    status: QueueStatus;
    estimatedStartUtc?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateQueueTicketDTO {
    centerId: UUID;
    serviceRequestId: UUID;
    reason?: string;
    priority?: number;
}

export interface UpdateQueueTicketDTO {
    status?: QueueStatus;
    estimatedStartUtc?: string;
    priority?: number;
}

export interface QueueFilters {
    centerId?: UUID;
    date?: string;  // YYYY-MM-DD
    status?: QueueStatus;
}

export interface QueueReorderDTO {
    ticketIds: UUID[];  // array theo thứ tự mới
}
