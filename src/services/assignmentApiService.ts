import { api } from "./api";

/**
 * Assignment API Service
 * Handles booking-to-technician task scheduling
 */

export interface AssignmentDto {
    id: string;
    technicianId: string;
    centerId: string;
    bookingId?: string;
    plannedStartUtc: string; // ISO 8601 UTC
    plannedEndUtc: string; // ISO 8601 UTC
    status: string;
    note?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAssignmentDto {
    bookingId: string;
    technicianId: string;
    plannedStartUtc: string; // ISO 8601 UTC
    plannedEndUtc: string; // ISO 8601 UTC
    note?: string;
}

export interface RescheduleAssignmentDto {
    newPlannedStartUtc: string;
    newPlannedEndUtc: string;
    reason?: string;
}

export interface ReassignTechnicianDto {
    newTechnicianId: string;
    reason?: string;
}

export const assignmentApiService = {
    /**
     * Create a new assignment
     * Booking must be APPROVED before creating assignment
     */
    async create(data: CreateAssignmentDto): Promise<AssignmentDto> {
        const response = await api.post<AssignmentDto>("/Assignment", data);
        return response.data;
    },

    /**
     * Get a single assignment by ID
     */
    async getById(id: string): Promise<AssignmentDto> {
        const response = await api.get<AssignmentDto>(`/Assignment/${id}`);
        return response.data;
    },

    /**
     * Get assignments with filters
     * Useful for loading assignments by center, date, or status
     */
    async getByRange(params: {
        centerId?: string;
        date?: string; // YYYY-MM-DD
        status?: string;
    }): Promise<AssignmentDto[]> {
        const queryParams = new URLSearchParams();
        if (params.centerId) queryParams.append("centerId", params.centerId);
        if (params.date) queryParams.append("date", params.date);
        if (params.status) queryParams.append("status", params.status);

        const response = await api.get<AssignmentDto[]>(
            `/Assignment/range${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
        );
        return response.data;
    },

    /**
     * Reschedule an assignment to a different time
     */
    async reschedule(id: string, data: RescheduleAssignmentDto): Promise<AssignmentDto> {
        const response = await api.put<AssignmentDto>(`/Assignment/${id}/reschedule`, data);
        return response.data;
    },

    /**
     * Reassign an assignment to a different technician
     */
    async reassign(id: string, data: ReassignTechnicianDto): Promise<AssignmentDto> {
        const response = await api.put<AssignmentDto>(`/Assignment/${id}/reassign`, data);
        return response.data;
    },

    /**
     * Cancel an assignment
     */
    async cancel(id: string): Promise<{ success: boolean; message: string }> {
        const response = await api.delete<{ success: boolean; message: string }>(`/Assignment/${id}`);
        return response.data;
    },

    /**
     * Mark assignment as technician no-show
     */
    async markNoShow(id: string): Promise<{ success: boolean; message: string }> {
        const response = await api.put<{ success: boolean; message: string }>(`/Assignment/${id}/noshow`, {});
        return response.data;
    },
};
