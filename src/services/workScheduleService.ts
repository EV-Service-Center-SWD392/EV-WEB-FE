import { api } from "./api";
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
};
