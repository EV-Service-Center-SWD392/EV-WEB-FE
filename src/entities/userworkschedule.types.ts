// UserWorkSchedule entity types based on Swagger API specification

export type ShiftType = "Morning" | "Evening" | "Night";

export interface UserWorkSchedule {
  id: string; // UUID
  userId: string; // UUID
  workScheduleId?: string; // UUID (optional as it's auto-created)
  centerName: string; // Service center name
  shift: ShiftType;
  workDate: string; // ISO 8601 date-time
  status?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Related data if populated
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  workSchedule?: {
    id: string;
    starttime: string;
    endtime: string;
  };
}

// Shift time definitions for reference
export const SHIFT_TIMES = {
  Morning: { start: "07:00", end: "12:00" },
  Evening: { start: "13:00", end: "19:00" },
  Night: { start: "20:00", end: "06:00" }, // next day
} as const;

export interface CreateUserWorkScheduleDto {
  userId: string; // UUID - technician ID
  centerName: string; // Service center name
  shift: ShiftType; // "Morning" | "Evening" | "Night"
  workDate: string; // ISO 8601 date-time (YYYY-MM-DD format)
}

export interface UpdateUserWorkScheduleDto {
  status?: string | null;
  isActive: boolean;
}

export interface BulkAssignTechniciansDto {
  centerName: string; // Service center name
  shift: ShiftType;
  workDate: string; // ISO 8601 date-time
  technicianIds: string[]; // Array of technician UUIDs (min 1 item)
}

export interface AutoAssignRequestDto {
  centerName: string; // Service center name
  shift: ShiftType;
  workDate: string; // ISO 8601 date-time
  requiredTechnicianCount: number; // 1-50
  requiredSkills?: string[] | null;
}

export interface BulkAssignResult {
  successfulAssignments: UserWorkSchedule[];
  failedAssignments: Array<{
    technicianId: string;
    error: string;
  }>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

export interface UserWorkScheduleFilters {
  userId?: string; // UUID
  workScheduleId?: string; // UUID
  startDate?: string; // ISO 8601 date-time
  endDate?: string; // ISO 8601 date-time
  shift?: ShiftType;
  centerName?: string; // Service center name
}

export interface UserWorkScheduleListResponse {
  data: UserWorkSchedule[];
  total?: number;
}

export interface AvailabilityCheck {
  isAvailable: boolean;
  conflicts?: UserWorkSchedule[];
}

export interface WorkloadInfo {
  userId: string;
  date: string;
  totalHours: number;
  shifts: UserWorkSchedule[];
}

// Response from GET /api/UserWorkSchedule/technicians-schedules
export interface TechnicianScheduleInfo {
  userId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  schedules: Array<{
    userWorkScheduleId: string;
    workScheduleId: string;
    startTime: string; // ISO 8601
    endTime: string; // ISO 8601
    centerName: string;
    status: string;
    createdAt: string;
  }>;
}

export interface TechniciansSchedulesFilters {
  centerName?: string;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
}
