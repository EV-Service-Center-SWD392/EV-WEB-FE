import { api } from "./api";
import {
  UserWorkSchedule,
  CreateUserWorkScheduleDto,
  UpdateUserWorkScheduleDto,
  BulkAssignTechniciansDto,
  AutoAssignRequestDto,
  BulkAssignResult,
  AvailabilityCheck,
  WorkloadInfo,
} from "@/entities/userworkschedule.types";

export interface UserWorkScheduleDto {
  id: string;
  userId: string;
  workScheduleId: string;
  centerId: string;
  shift: "Morning" | "Evening" | "Night";
  workDate: string;
  status?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  async createUserWorkSchedule(data: CreateUserWorkScheduleDto): Promise<UserWorkSchedule> {
    const response = await api.post<UserWorkSchedule>("/api/UserWorkSchedule", data);
    return response.data;
  },

  async getUserWorkSchedule(id: string): Promise<UserWorkSchedule> {
    const response = await api.get<UserWorkSchedule>(`/api/UserWorkSchedule/${id}`);
    return response.data;
  },

  async updateUserWorkSchedule(id: string, data: UpdateUserWorkScheduleDto): Promise<UserWorkSchedule> {
    const response = await api.put<UserWorkSchedule>(`/api/UserWorkSchedule/${id}`, data);
    return response.data;
  },

  async deleteUserWorkSchedule(id: string): Promise<void> {
    await api.delete(`/api/UserWorkSchedule/${id}`);
  },

  async getUserWorkSchedulesByUser(userId: string): Promise<UserWorkSchedule[]> {
    const response = await api.get<UserWorkSchedule[]>(`/api/UserWorkSchedule/user/${userId}`);
    return response.data;
  },

  async getUserWorkSchedulesByWorkSchedule(workScheduleId: string): Promise<UserWorkSchedule[]> {
    const response = await api.get<UserWorkSchedule[]>(`/api/UserWorkSchedule/workschedule/${workScheduleId}`);
    return response.data;
  },

  async getUserWorkSchedulesByRange(userId: string, startDate: string, endDate: string): Promise<UserWorkSchedule[]> {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await api.get<UserWorkSchedule[]>(`/api/UserWorkSchedule/user/${userId}/range?${params.toString()}`);
    return response.data;
  },

  async checkAvailability(userId?: string, workScheduleId?: string): Promise<AvailabilityCheck> {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (workScheduleId) params.append("workScheduleId", workScheduleId);
    const response = await api.get<AvailabilityCheck>(`/api/UserWorkSchedule/availability?${params.toString()}`);
    return response.data;
  },

  async bulkAssignTechnicians(data: BulkAssignTechniciansDto): Promise<BulkAssignResult> {
    const response = await api.post<BulkAssignResult>("/api/UserWorkSchedule/bulk-assign", data);
    return response.data;
  },

  async autoAssignTechnicians(data: AutoAssignRequestDto): Promise<BulkAssignResult> {
    const response = await api.post<BulkAssignResult>("/api/UserWorkSchedule/auto-assign", data);
    return response.data;
  },

  async getConflicts(userId: string, startTime?: string, endTime?: string): Promise<UserWorkSchedule[]> {
    const params = new URLSearchParams();
    if (startTime) params.append("startTime", startTime);
    if (endTime) params.append("endTime", endTime);
    const response = await api.get<UserWorkSchedule[]>(`/api/UserWorkSchedule/conflicts/${userId}?${params.toString()}`);
    return response.data;
  },

  async getWorkload(userId: string, date?: string): Promise<WorkloadInfo> {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    const response = await api.get<WorkloadInfo>(`/api/UserWorkSchedule/workload/${userId}?${params.toString()}`);
    return response.data;
  },

  async getUserWorkSchedulesByCenterAndRange(centerId: string, startDate: string, endDate: string): Promise<UserWorkSchedule[]> {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await api.get<UserWorkSchedule[]>(`/api/UserWorkSchedule/center/${centerId}/range?${params.toString()}`);
    return response.data;
  },

  async getTechniciansSchedules(params: { startDate: string; endDate: string }): Promise<UserWorkSchedule[]> {
    const queryParams = new URLSearchParams(params);
    const response = await api.get<any[]>(`/UserWorkSchedule/technicians-schedules?${queryParams.toString()}`);
    return response.data;
  },
};