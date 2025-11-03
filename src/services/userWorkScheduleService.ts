import { api } from "./api";
import {
  UserWorkSchedule,
  CreateUserWorkScheduleDto,
  UpdateUserWorkScheduleDto,
  BulkAssignTechniciansDto,
  AutoAssignRequestDto,
  BulkAssignResult,
  UserWorkScheduleFilters,
  AvailabilityCheck,
  WorkloadInfo,
} from "@/entities/userworkschedule.types";

/**
 * UserWorkSchedule Service
 * Manages technician work schedule assignments based on Swagger API specification
 * Note: POST to UserWorkSchedule automatically creates a WorkSchedule if needed
 */

export const userWorkScheduleService = {
  /**
   * Create a new user work schedule assignment
   * POST /api/UserWorkSchedule
   * This will automatically create a WorkSchedule if it doesn't exist
   * 
   * Required fields:
   * - userId: Technician UUID
   * - centerId: Service center UUID
   * - shift: "Morning" | "Evening" | "Night"
   * - workDate: ISO 8601 date-time (YYYY-MM-DD)
   */
  async createUserWorkSchedule(
    data: CreateUserWorkScheduleDto
  ): Promise<UserWorkSchedule> {
    try {
      const response = await api.post<UserWorkSchedule>(
        "/api/UserWorkSchedule",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating user work schedule:", error);
      throw error;
    }
  },

  /**
   * Get user work schedule by ID
   * GET /api/UserWorkSchedule/{id}
   */
  async getUserWorkSchedule(id: string): Promise<UserWorkSchedule> {
    try {
      const response = await api.get<UserWorkSchedule>(
        `/api/UserWorkSchedule/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching user work schedule ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing user work schedule assignment
   * PUT /api/UserWorkSchedule/{id}
   * 
   * Optional fields:
   * - status: Assignment status
   * - isActive: Boolean flag for soft delete
   */
  async updateUserWorkSchedule(
    id: string,
    data: UpdateUserWorkScheduleDto
  ): Promise<UserWorkSchedule> {
    try {
      const response = await api.put<UserWorkSchedule>(
        `/api/UserWorkSchedule/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating user work schedule ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a user work schedule assignment
   * DELETE /api/UserWorkSchedule/{id}
   */
  async deleteUserWorkSchedule(id: string): Promise<void> {
    try {
      await api.delete(`/api/UserWorkSchedule/${id}`);
    } catch (error) {
      console.error(`Error deleting user work schedule ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get user work schedules by user ID
   * GET /api/UserWorkSchedule/user/{userId}
   */
  async getUserWorkSchedulesByUser(
    userId: string
  ): Promise<UserWorkSchedule[]> {
    try {
      const response = await api.get<UserWorkSchedule[]>(
        `/api/UserWorkSchedule/user/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching user work schedules for user ${userId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Get user work schedules by work schedule ID
   * GET /api/UserWorkSchedule/workschedule/{workScheduleId}
   */
  async getUserWorkSchedulesByWorkSchedule(
    workScheduleId: string
  ): Promise<UserWorkSchedule[]> {
    try {
      const response = await api.get<UserWorkSchedule[]>(
        `/api/UserWorkSchedule/workschedule/${workScheduleId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching user work schedules for work schedule ${workScheduleId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Get user work schedules within a date range
   * GET /api/UserWorkSchedule/user/{userId}/range
   * Query params: startDate, endDate
   * 
   * Useful for calendar views and schedule planning
   */
  async getUserWorkSchedulesByRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<UserWorkSchedule[]> {
    try {
      const params = new URLSearchParams();
      params.append("startDate", startDate);
      params.append("endDate", endDate);

      const response = await api.get<UserWorkSchedule[]>(
        `/api/UserWorkSchedule/user/${userId}/range?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching user work schedules by range for user ${userId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Check availability for a user or work schedule
   * GET /api/UserWorkSchedule/availability
   * Query params: userId, workScheduleId
   */
  async checkAvailability(
    userId?: string,
    workScheduleId?: string
  ): Promise<AvailabilityCheck> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      if (workScheduleId) params.append("workScheduleId", workScheduleId);

      const response = await api.get<AvailabilityCheck>(
        `/api/UserWorkSchedule/availability?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking availability:", error);
      throw error;
    }
  },

  /**
   * Bulk assign multiple technicians to the same work schedule
   * POST /api/UserWorkSchedule/bulk-assign
   * 
   * Required fields:
   * - centerId: Service center UUID
   * - shift: "Morning" | "Evening" | "Night"
   * - workDate: ISO 8601 date-time (YYYY-MM-DD)
   * - technicianIds: Array of technician UUIDs (min 1)
   * 
   * Returns summary of successful and failed assignments
   */
  async bulkAssignTechnicians(
    data: BulkAssignTechniciansDto
  ): Promise<BulkAssignResult> {
    try {
      const response = await api.post<BulkAssignResult>(
        "/api/UserWorkSchedule/bulk-assign",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error bulk assigning technicians:", error);
      throw error;
    }
  },

  /**
   * Automatically assign available technicians to a work schedule
   * POST /api/UserWorkSchedule/auto-assign
   * 
   * Required fields:
   * - centerId: Service center UUID
   * - shift: "Morning" | "Evening" | "Night"
   * - workDate: ISO 8601 date-time (YYYY-MM-DD)
   * - requiredTechnicianCount: Number of technicians needed (1-50)
   * 
   * Optional:
   * - requiredSkills: Array of required skills (not implemented yet)
   * 
   * System will automatically find and assign available technicians
   */
  async autoAssignTechnicians(
    data: AutoAssignRequestDto
  ): Promise<BulkAssignResult> {
    try {
      const response = await api.post<BulkAssignResult>(
        "/api/UserWorkSchedule/auto-assign",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error auto-assigning technicians:", error);
      throw error;
    }
  },

  /**
   * Get scheduling conflicts for a user
   * GET /api/UserWorkSchedule/conflicts/{userId}
   * Query params: startTime, endTime
   */
  async getConflicts(
    userId: string,
    startTime?: string,
    endTime?: string
  ): Promise<UserWorkSchedule[]> {
    try {
      const params = new URLSearchParams();
      if (startTime) params.append("startTime", startTime);
      if (endTime) params.append("endTime", endTime);

      const response = await api.get<UserWorkSchedule[]>(
        `/api/UserWorkSchedule/conflicts/${userId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching conflicts for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get workload information for a user on a specific date
   * GET /api/UserWorkSchedule/workload/{userId}
   * Query params: date
   */
  async getWorkload(userId: string, date?: string): Promise<WorkloadInfo> {
    try {
      const params = new URLSearchParams();
      if (date) params.append("date", date);

      const response = await api.get<WorkloadInfo>(
        `/api/UserWorkSchedule/workload/${userId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching workload for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get all user work schedules for a center within a date range
   * This endpoint may not exist in the API yet
   * GET /api/UserWorkSchedule/center/{centerId}/range
   * Query params: startDate, endDate
   * 
   * TODO: Request backend to add this endpoint to avoid N+1 query problem
   */
  async getUserWorkSchedulesByCenterAndRange(
    centerId: string,
    startDate: string,
    endDate: string
  ): Promise<UserWorkSchedule[]> {
    try {
      const params = new URLSearchParams();
      params.append("startDate", startDate);
      params.append("endDate", endDate);

      // This endpoint might not exist yet - you'll need backend support
      const response = await api.get<UserWorkSchedule[]>(
        `/api/UserWorkSchedule/center/${centerId}/range?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching user work schedules for center ${centerId}:`,
        error
      );
      throw error;
    }
  },
};
