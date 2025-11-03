import { api } from "./api";

/**
 * User Work Schedule Service
 * Manages technician assignments to work shifts
 */

export interface UserWorkScheduleDto {
    id: string;
    userId: string;
    workScheduleId: string;
    centerId: string;
    shift: "Morning" | "Evening" | "Night";
    workDate: string; // ISO 8601 UTC
    status?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateUserWorkScheduleDto {
    userId: string;
    centerId: string;
    shift: "Morning" | "Evening" | "Night";
    workDate: string; // ISO 8601 UTC
    workScheduleId?: string; // Optional, ignored if provided
}

export interface UpdateUserWorkScheduleDto {
    status?: string;
    isActive?: boolean;
}

export interface BulkAssignTechniciansDto {
    centerId: string;
    shift: "Morning" | "Evening" | "Night";
    workDate: string;
    technicianIds: string[];
}

export interface AutoAssignRequestDto {
    centerId: string;
    shift: "Morning" | "Evening" | "Night";
    workDate: string;
    requiredTechnicianCount: number;
    requiredSkills?: string[];
}

export interface AssignmentResultDto {
    successCount: number;
    failureCount: number;
    successes: Array<{
        technicianId: string;
        assignmentId: string;
    }>;
    failures: Array<{
        technicianId: string;
        reason: string;
    }>;
}

export interface WorkloadDto {
    totalShifts: number;
    activeShifts: number;
    completedShifts: number;
    [key: string]: unknown;
}

export const userWorkScheduleService = {
    /**
     * Get a single user work schedule by ID
     */
    async getById(id: string): Promise<UserWorkScheduleDto> {
        const response = await api.get<UserWorkScheduleDto>(`/UserWorkSchedule/${id}`);
        return response.data;
    },

    /**
     * Get all active assignments for a user
     */
    async getByUser(userId: string): Promise<UserWorkScheduleDto[]> {
        const response = await api.get<UserWorkScheduleDto[]>(`/UserWorkSchedule/user/${userId}`);
        return response.data;
    },

    /**
     * Get all technicians assigned to a work schedule
     */
    async getByWorkSchedule(workScheduleId: string): Promise<UserWorkScheduleDto[]> {
        const response = await api.get<UserWorkScheduleDto[]>(`/UserWorkSchedule/workschedule/${workScheduleId}`);
        return response.data;
    },

    /**
     * Get user assignments within a date range
     */
    async getByUserRange(params: {
        userId: string;
        startDate: string; // ISO 8601
        endDate: string; // ISO 8601
    }): Promise<UserWorkScheduleDto[]> {
        const queryParams = new URLSearchParams({
            startDate: params.startDate,
            endDate: params.endDate,
        });

        const response = await api.get<UserWorkScheduleDto[]>(
            `/UserWorkSchedule/user/${params.userId}/range?${queryParams.toString()}`
        );
        return response.data;
    },

    /**
     * Check if a technician is available for a work schedule
     */
    async checkAvailability(params: {
        userId: string;
        workScheduleId: string;
    }): Promise<{ isAvailable: boolean }> {
        const queryParams = new URLSearchParams({
            userId: params.userId,
            workScheduleId: params.workScheduleId,
        });

        const response = await api.get<{ isAvailable: boolean }>(
            `/UserWorkSchedule/availability?${queryParams.toString()}`
        );
        return response.data;
    },

    /**
     * Create a new user work schedule assignment
     * This creates the work schedule and assigns the technician
     */
    async create(data: CreateUserWorkScheduleDto): Promise<UserWorkScheduleDto> {
        const response = await api.post<UserWorkScheduleDto>("/UserWorkSchedule", data);
        return response.data;
    },

    /**
     * Update an existing user work schedule
     */
    async update(id: string, data: UpdateUserWorkScheduleDto): Promise<UserWorkScheduleDto> {
        const response = await api.put<UserWorkScheduleDto>(`/UserWorkSchedule/${id}`, data);
        return response.data;
    },

    /**
     * Delete a user work schedule (soft delete)
     */
    async delete(id: string): Promise<{ message: string }> {
        const response = await api.delete<{ message: string }>(`/UserWorkSchedule/${id}`);
        return response.data;
    },

    /**
     * Bulk assign multiple technicians to a shift
     */
    async bulkAssign(data: BulkAssignTechniciansDto): Promise<AssignmentResultDto> {
        const response = await api.post<AssignmentResultDto>("/UserWorkSchedule/bulk-assign", data);
        return response.data;
    },

    /**
     * Auto-assign available technicians to a shift
     */
    async autoAssign(data: AutoAssignRequestDto): Promise<AssignmentResultDto> {
        const response = await api.post<AssignmentResultDto>("/UserWorkSchedule/auto-assign", data);
        return response.data;
    },

    /**
     * Get conflicts for a technician in a time window
     */
    async getConflicts(params: {
        userId: string;
        startTime: string; // ISO 8601
        endTime: string; // ISO 8601
    }): Promise<UserWorkScheduleDto[]> {
        const queryParams = new URLSearchParams({
            startTime: params.startTime,
            endTime: params.endTime,
        });

        const response = await api.get<UserWorkScheduleDto[]>(
            `/UserWorkSchedule/conflicts/${params.userId}?${queryParams.toString()}`
        );
        return response.data;
    },

    /**
     * Get workload metrics for a technician on a specific date
     */
    async getWorkload(params: {
        userId: string;
        date: string; // ISO 8601
    }): Promise<WorkloadDto> {
        const queryParams = new URLSearchParams({
            date: params.date,
        });

        const response = await api.get<WorkloadDto>(
            `/UserWorkSchedule/workload/${params.userId}?${queryParams.toString()}`
        );
        return response.data;
    },
};
