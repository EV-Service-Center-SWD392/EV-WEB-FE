import type {
    Assignment,
    CreateAssignmentDTO,
    UpdateAssignmentDTO,
    AssignmentFilters,
} from "@/entities/assignment.types";
// TEMPORARY: Mock data for development
import { getMockAssignments } from "@/lib/mockData/schedulingMockData";

import { api } from "./api";

const BASE_PATH = "/api/assignments";
const USE_MOCK_DATA = true; // Set to false when connecting to real API

/**
 * Assignment Service
 * Manages technician assignments to bookings or service requests
 */
export const assignmentService = {
    /**
     * Create a new assignment for a technician
     */
    async create(dto: CreateAssignmentDTO): Promise<Assignment> {
        const response = await api.post<Assignment>(BASE_PATH, dto);
        return response.data;
    },

    /**
     * Get assignments by filters (centerId, date, technicianId, status)
     */
    async getAssignments(filters: AssignmentFilters): Promise<Assignment[]> {
        // TEMPORARY: Use mock data during development
        if (USE_MOCK_DATA) {
            return getMockAssignments(filters.centerId!, filters.date!);
        }

        const response = await api.get<Assignment[]>(BASE_PATH, {
            params: filters,
        });
        return response.data;
    },

    /**
     * Get a single assignment by ID
     */
    async getById(id: string): Promise<Assignment> {
        const response = await api.get<Assignment>(`${BASE_PATH}/${id}`);
        return response.data;
    },

    /**
     * Update an assignment (status, times, notes)
     */
    async update(id: string, dto: UpdateAssignmentDTO): Promise<Assignment> {
        const response = await api.patch<Assignment>(`${BASE_PATH}/${id}`, dto);
        return response.data;
    },

    /**
     * Delete/cancel an assignment
     */
    async delete(id: string): Promise<void> {
        await api.delete(`${BASE_PATH}/${id}`);
    },

    /**
     * Check for technician conflicts in a time window
     */
    async checkConflict(
        technicianId: string,
        startUtc: string,
        endUtc: string
    ): Promise<{ hasConflict: boolean; conflicts: Assignment[] }> {
        const response = await api.get<{
            hasConflict: boolean;
            conflicts: Assignment[];
        }>(`${BASE_PATH}/conflicts`, {
            params: { technicianId, startUtc, endUtc },
        });
        return response.data;
    },
};

export default assignmentService;
