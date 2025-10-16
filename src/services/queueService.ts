import type {
    QueueTicket,
    CreateQueueTicketDTO,
    UpdateQueueTicketDTO,
    QueueFilters,
    QueueReorderDTO,
} from "@/entities/queue.types";
// TEMPORARY: Mock data for development
import { getMockQueueTickets } from "@/lib/mockData/schedulingMockData";

import { api } from "./api";

const BASE_PATH = "/api/queue";
const USE_MOCK_DATA = true; // Set to false when connecting to real API

/**
 * Queue Service
 * Manages service request queue for walk-ins and overflow
 */
export const queueService = {
    /**
     * Get queue tickets by center and date
     */
    async getQueue(filters: QueueFilters): Promise<QueueTicket[]> {
        // TEMPORARY: Use mock data during development
        if (USE_MOCK_DATA) {
            return getMockQueueTickets(filters.centerId!, filters.date!);
        }

        const response = await api.get<QueueTicket[]>(BASE_PATH, {
            params: filters,
        });
        return response.data;
    },

    /**
     * Add a service request to the queue
     */
    async addToQueue(dto: CreateQueueTicketDTO): Promise<QueueTicket> {
        const response = await api.post<QueueTicket>(BASE_PATH, dto);
        return response.data;
    },

    /**
     * Get a single queue ticket by ID
     */
    async getById(id: string): Promise<QueueTicket> {
        const response = await api.get<QueueTicket>(`${BASE_PATH}/${id}`);
        return response.data;
    },

    /**
     * Update queue ticket (status, ETA, priority)
     */
    async update(id: string, dto: UpdateQueueTicketDTO): Promise<QueueTicket> {
        const response = await api.patch<QueueTicket>(`${BASE_PATH}/${id}`, dto);
        return response.data;
    },

    /**
     * Reorder queue tickets (drag & drop)
     */
    async reorder(
        centerId: string,
        date: string,
        dto: QueueReorderDTO
    ): Promise<void> {
        await api.post(`${BASE_PATH}/reorder`, {
            centerId,
            date,
            ...dto,
        });
    },

    /**
     * Mark a queue ticket as No-Show
     */
    async markNoShow(id: string): Promise<QueueTicket> {
        const response = await api.post<QueueTicket>(`${BASE_PATH}/${id}/no-show`);
        return response.data;
    },

    /**
     * Update estimated start time for a queue ticket
     */
    async updateEta(id: string, estimatedStartUtc: string): Promise<QueueTicket> {
        const response = await api.patch<QueueTicket>(`${BASE_PATH}/${id}/eta`, {
            estimatedStartUtc,
        });
        return response.data;
    },

    /**
     * Convert queue ticket to assignment (mark as Converted)
     */
    async convertToAssignment(id: string): Promise<QueueTicket> {
        const response = await api.post<QueueTicket>(
            `${BASE_PATH}/${id}/convert`
        );
        return response.data;
    },

    /**
     * Remove a ticket from the queue
     */
    async delete(id: string): Promise<void> {
        await api.delete(`${BASE_PATH}/${id}`);
    },
};

export default queueService;
