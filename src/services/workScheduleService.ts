import { api } from "./api";

/**
 * Work Schedule Service
 * Manages shift schedules at service centers
 */

export interface WorkScheduleDto {
    workScheduleId: string;
    centerId: string;
    starttime: string; // ISO 8601 UTC
    endtime: string; // ISO 8601 UTC
    status?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateWorkScheduleDto {
    centerId: string;
    starttime: string;
    endtime: string;
}

export interface UpdateWorkScheduleDto {
    centerId: string;
    starttime: string;
    endtime: string;
    status?: string;
    isActive?: boolean;
}

export const workScheduleService = {
    /**
     * Get a single work schedule by ID
     */
    async getById(id: string): Promise<WorkScheduleDto> {
        const response = await api.get<WorkScheduleDto>(`/WorkSchedule/${id}`);
        return response.data;
    },

    /**
     * Get schedules for a specific technician
     */
    async getByTechnician(technicianId: string): Promise<WorkScheduleDto[]> {
        const response = await api.get<WorkScheduleDto[]>(`/WorkSchedule/technician/${technicianId}`);
        return response.data;
    },

    /**
     * Get schedules within a date range
     */
    async getByRange(params: {
        start: string; // YYYY-MM-DD
        end: string; // YYYY-MM-DD
        technicianId?: string;
    }): Promise<WorkScheduleDto[]> {
        const queryParams = new URLSearchParams({
            start: params.start,
            end: params.end,
        });
        if (params.technicianId) {
            queryParams.append("technicianId", params.technicianId);
        }

        const response = await api.get<WorkScheduleDto[]>(`/WorkSchedule/range?${queryParams.toString()}`);
        return response.data;
    },

    /**
     * Get available schedules for a specific time window
     */
    async getAvailable(params: {
        date: string; // YYYY-MM-DD
        startTime: string; // HH:mm
        endTime: string; // HH:mm
    }): Promise<WorkScheduleDto[]> {
        const queryParams = new URLSearchParams({
            date: params.date,
            startTime: params.startTime,
            endTime: params.endTime,
        });

        const response = await api.get<WorkScheduleDto[]>(`/WorkSchedule/available?${queryParams.toString()}`);
        return response.data;
    },

    /**
     * Create a new work schedule
     */
    async create(data: CreateWorkScheduleDto): Promise<WorkScheduleDto> {
        const response = await api.post<WorkScheduleDto>("/WorkSchedule", data);
        return response.data;
    },

    /**
     * Update an existing work schedule
     */
    async update(id: string, data: UpdateWorkScheduleDto): Promise<WorkScheduleDto> {
        const response = await api.put<WorkScheduleDto>(`/WorkSchedule/${id}`, data);
        return response.data;
    },

    /**
     * Delete a work schedule (soft delete)
     */
    async delete(id: string): Promise<{ message: string }> {
        const response = await api.delete<{ message: string }>(`/WorkSchedule/${id}`);
        return response.data;
    },
};
