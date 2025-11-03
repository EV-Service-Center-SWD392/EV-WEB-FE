import { api } from "./api";
<<<<<<< HEAD
import {
  WorkSchedule,
  CreateWorkScheduleDto,
  UpdateWorkScheduleDto,
  WorkScheduleFilters,
  WorkScheduleListResponse,
} from "@/entities/workschedule.types";

/**
 * WorkSchedule Service
 * Manages work schedule operations based on Swagger API specification
 */

export const workScheduleService = {
  /**
   * Create a new work schedule
   * POST /api/WorkSchedule
   */
  async createWorkSchedule(data: CreateWorkScheduleDto): Promise<WorkSchedule> {
    try {
      const response = await api.post<WorkSchedule>("/api/WorkSchedule", data);
      return response.data;
    } catch (error) {
      console.error("Error creating work schedule:", error);
      throw error;
    }
  },

  /**
   * Get work schedule by ID
   * GET /api/WorkSchedule/{id}
   */
  async getWorkSchedule(id: string): Promise<WorkSchedule> {
    try {
      const response = await api.get<WorkSchedule>(`/api/WorkSchedule/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching work schedule ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing work schedule
   * PUT /api/WorkSchedule/{id}
   */
  async updateWorkSchedule(
    id: string,
    data: UpdateWorkScheduleDto
  ): Promise<WorkSchedule> {
    try {
      const response = await api.put<WorkSchedule>(
        `/api/WorkSchedule/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating work schedule ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a work schedule
   * DELETE /api/WorkSchedule/{id}
   */
  async deleteWorkSchedule(id: string): Promise<void> {
    try {
      await api.delete(`/api/WorkSchedule/${id}`);
    } catch (error) {
      console.error(`Error deleting work schedule ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get work schedules by technician ID
   * GET /api/WorkSchedule/technician/{id}
   */
  async getWorkSchedulesByTechnician(
    technicianId: string
  ): Promise<WorkSchedule[]> {
    try {
      const response = await api.get<WorkSchedule[]>(
        `/api/WorkSchedule/technician/${technicianId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching work schedules for technician ${technicianId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Get work schedules within a date range
   * GET /api/WorkSchedule/range
   * Query params: start, end, technicianId (optional)
   */
  async getWorkSchedulesByRange(
    filters: WorkScheduleFilters
  ): Promise<WorkSchedule[]> {
    try {
      const params = new URLSearchParams();
      if (filters.start) params.append("start", filters.start);
      if (filters.end) params.append("end", filters.end);
      if (filters.technicianId)
        params.append("technicianId", filters.technicianId);

      const response = await api.get<WorkSchedule[]>(
        `/api/WorkSchedule/range?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching work schedules by range:", error);
      throw error;
    }
  },

  /**
   * Get available work schedules
   * GET /api/WorkSchedule/available
   * Query params: date, startTime, endTime
   */
  async getAvailableWorkSchedules(
    filters: WorkScheduleFilters
  ): Promise<WorkSchedule[]> {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append("date", filters.date);
      if (filters.startTime) params.append("startTime", filters.startTime);
      if (filters.endTime) params.append("endTime", filters.endTime);

      const response = await api.get<WorkSchedule[]>(
        `/api/WorkSchedule/available?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching available work schedules:", error);
      throw error;
    }
  },
=======

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
>>>>>>> origin/devBranch
};
