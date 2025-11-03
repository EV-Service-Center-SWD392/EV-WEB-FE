// WorkSchedule entity types based on Swagger API specification

export interface WorkSchedule {
  id: string; // UUID
  centerId: string; // UUID
  starttime: string; // ISO 8601 date-time
  endtime: string; // ISO 8601 date-time
  status?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkScheduleDto {
  centerId: string; // UUID
  starttime: string; // ISO 8601 date-time
  endtime: string; // ISO 8601 date-time
}

export interface UpdateWorkScheduleDto {
  centerId: string; // UUID
  starttime: string; // ISO 8601 date-time
  endtime: string; // ISO 8601 date-time
  status?: string | null;
  isActive: boolean;
}

export interface WorkScheduleFilters {
  start?: string; // date format
  end?: string; // date format
  technicianId?: string; // UUID
  date?: string; // date format
  startTime?: string; // time format
  endTime?: string; // time format
}

export interface WorkScheduleListResponse {
  data: WorkSchedule[];
  total?: number;
}
