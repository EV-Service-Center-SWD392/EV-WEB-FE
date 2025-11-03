import type {
  Assignment,
  AssignmentFilters,
  AssignmentStatus,
  CreateAssignmentDTO,
  UpdateAssignmentDTO,
} from "@/entities/assignment.types";
import {
  getMockAssignments,
  mockAssignments,
} from "@/lib/mockData/schedulingMockData";

import { api } from "./api";

const BASE_PATH = "/api/assignments";
const CONFLICTS_PATH = `${BASE_PATH}/conflicts`;
const USE_MOCK_DATA = false;

type AssignmentApiPayload = {
  [key: string]: unknown;
  id?: string;
  assignmentId?: string;
  centerId?: string;
  center?: { id?: string };
  technicianId?: string;
  technician?: { id?: string };
  bookingId?: string;
  booking?: { id?: string };
  workItemId?: string;
  serviceRequestId?: string;
  serviceRequest?: { id?: string };
  requestId?: string;
  startUtc?: string;
  startAt?: string;
  startTime?: string;
  start?: string;
  endUtc?: string;
  endAt?: string;
  endTime?: string;
  end?: string;
  status?: string;
  assignmentStatus?: string;
  note?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

const assignmentStatusMap: Record<string, AssignmentStatus> = {
  pending: "Pending",
  assigned: "Assigned",
  inqueue: "InQueue",
  in_queue: "InQueue",
  active: "Active",
  completed: "Completed",
  reassigned: "Reassigned",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  cancelledbycustomer: "CancelledByCustomer",
  cancelled_by_customer: "CancelledByCustomer",
};

const normalizeStatus = (status?: string): AssignmentStatus => {
  if (!status) return "Pending";
  const key = status.toString().toLowerCase().replace(/[\s-]+/g, "_");
  return assignmentStatusMap[key] ?? "Pending";
};

const coerceDate = (value?: string): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const mapAssignment = (payload: AssignmentApiPayload): Assignment => {
  const fallbackId = payload.id ?? payload.assignmentId ?? `assignment-${Date.now()}`;
  return {
    id: fallbackId,
    centerId: payload.centerId ?? payload.center?.id ?? "",
    technicianId: payload.technicianId ?? payload.technician?.id ?? "",
    bookingId: payload.bookingId ?? payload.workItemId ?? payload.booking?.id,
    serviceRequestId: payload.serviceRequestId ?? payload.requestId ?? payload.serviceRequest?.id,
    startUtc:
      coerceDate(payload.startUtc) ??
      coerceDate(payload.startTime) ??
      coerceDate(payload.startAt) ??
      coerceDate(payload.start),
    endUtc:
      coerceDate(payload.endUtc) ??
      coerceDate(payload.endTime) ??
      coerceDate(payload.endAt) ??
      coerceDate(payload.end),
    status: normalizeStatus(
      typeof payload.assignmentStatus === "string" ? payload.assignmentStatus : (payload.status as string),
    ),
    note: typeof payload.note === "string" ? payload.note : (payload.notes as string | undefined),
    createdAt: coerceDate(payload.createdAt) ?? new Date().toISOString(),
    updatedAt: coerceDate(payload.updatedAt) ?? coerceDate(payload.createdAt),
  };
};

const defaultDate = () => new Date().toISOString().split("T")[0];

class AssignmentService {
  private async requestOrMock<T>(
    executor: () => Promise<T>,
    fallback: () => T | Promise<T>,
  ): Promise<T> {
    if (USE_MOCK_DATA) return fallback();
    try {
      return await executor();
    } catch (error) {
      console.warn("[assignmentService] Falling back to mock data", error);
      return fallback();
    }
  }

  async create(dto: CreateAssignmentDTO): Promise<Assignment> {
    return this.requestOrMock(
      async () => {
        const { data } = await api.post<AssignmentApiPayload>(BASE_PATH, dto);
        return mapAssignment(data);
      },
      () => {
        const nowIso = new Date().toISOString();
        const plannedStart = coerceDate(dto.plannedStartUtc);
        const fallbackAssignment: Assignment = {
          id: `assignment-${Date.now()}`,
          centerId: dto.centerId,
          technicianId: dto.technicianId,
          bookingId: dto.bookingId,
          serviceRequestId: dto.serviceRequestId,
          startUtc: plannedStart,
          status: "Assigned",
          note: dto.note,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        mockAssignments.unshift(fallbackAssignment);
        return fallbackAssignment;
      },
    );
  }

  async getAssignments(filters: AssignmentFilters): Promise<Assignment[]> {
    return this.requestOrMock(
      async () => {
        const { data } = await api.get<AssignmentApiPayload[] | { items?: AssignmentApiPayload[] }>(BASE_PATH, {
          params: filters,
        });
        const payload = Array.isArray(data) ? data : data?.items ?? [];
        return payload.map(mapAssignment);
      },
      async () => {
        if (filters.centerId) {
          const assignments = await getMockAssignments(filters.centerId, filters.date ?? defaultDate());
          if (filters.status) {
            return assignments.filter((assignment) => assignment.status === filters.status);
          }
          return assignments;
        }
        return [...mockAssignments];
      },
    );
  }

  async getById(id: string): Promise<Assignment | null> {
    return this.requestOrMock(
      async () => {
        const { data } = await api.get<AssignmentApiPayload>(`${BASE_PATH}/${id}`);
        return mapAssignment(data);
      },
      async () => mockAssignments.find((assignment) => assignment.id === id) ?? null,
    );
  }

  async update(id: string, dto: UpdateAssignmentDTO): Promise<Assignment> {
    return this.requestOrMock(
      async () => {
        const { data } = await api.patch<AssignmentApiPayload>(`${BASE_PATH}/${id}`, dto);
        return mapAssignment(data);
      },
      async () => {
        const index = mockAssignments.findIndex((assignment) => assignment.id === id);
        if (index === -1) throw new Error("Assignment not found");

        const existing = mockAssignments[index];
        const updatedAssignment: Assignment = {
          ...existing,
          startUtc: dto.startUtc ?? existing.startUtc,
          endUtc: dto.endUtc ?? existing.endUtc,
          note: dto.note ?? existing.note,
          status: dto.status ?? existing.status,
          updatedAt: new Date().toISOString(),
        };

        mockAssignments[index] = updatedAssignment;
        return updatedAssignment;
      },
    );
  }

  async delete(id: string): Promise<void> {
    return this.requestOrMock(
      async () => {
        await api.delete(`${BASE_PATH}/${id}`);
      },
      async () => {
        const index = mockAssignments.findIndex((assignment) => assignment.id === id);
        if (index !== -1) {
          mockAssignments.splice(index, 1);
        }
      },
    );
  }

  async reschedule(
    id: string,
    newPlannedStartUtc: string,
    note?: string
  ): Promise<Assignment> {
    return this.requestOrMock(
      async () => {
        const { data } = await api.put<AssignmentApiPayload>(`${BASE_PATH}/${id}/reschedule`, {
          newPlannedStartUtc,
          note,
        });
        return mapAssignment(data);
      },
      async () => {
        const index = mockAssignments.findIndex((assignment) => assignment.id === id);
        if (index === -1) throw new Error("Assignment not found");

        const existing = mockAssignments[index];
        const updatedAssignment: Assignment = {
          ...existing,
          startUtc: newPlannedStartUtc,
          note: note ?? existing.note,
          updatedAt: new Date().toISOString(),
        };

        mockAssignments[index] = updatedAssignment;
        return updatedAssignment;
      },
    );
  }

  async reassign(
    id: string,
    newTechnicianId: string,
    note?: string
  ): Promise<Assignment> {
    return this.requestOrMock(
      async () => {
        const { data } = await api.put<AssignmentApiPayload>(`${BASE_PATH}/${id}/reassign`, {
          newTechnicianId,
          note,
        });
        return mapAssignment(data);
      },
      async () => {
        const index = mockAssignments.findIndex((assignment) => assignment.id === id);
        if (index === -1) throw new Error("Assignment not found");

        const existing = mockAssignments[index];
        const updatedAssignment: Assignment = {
          ...existing,
          technicianId: newTechnicianId,
          status: "Reassigned",
          note: note ?? existing.note,
          updatedAt: new Date().toISOString(),
        };

        mockAssignments[index] = updatedAssignment;
        return updatedAssignment;
      },
    );
  }

  async markNoShow(id: string, note?: string): Promise<Assignment> {
    return this.requestOrMock(
      async () => {
        const { data } = await api.put<AssignmentApiPayload>(`${BASE_PATH}/${id}/noshow`, {
          note,
        });
        return mapAssignment(data);
      },
      async () => {
        const index = mockAssignments.findIndex((assignment) => assignment.id === id);
        if (index === -1) throw new Error("Assignment not found");

        const existing = mockAssignments[index];
        const updatedAssignment: Assignment = {
          ...existing,
          status: "Cancelled",
          note: note ? `No show: ${note}` : "No show",
          updatedAt: new Date().toISOString(),
        };

        mockAssignments[index] = updatedAssignment;
        return updatedAssignment;
      },
    );
  }

  async checkConflict(
    technicianId: string,
    startUtc: string,
    endUtc: string,
  ): Promise<{ hasConflict: boolean; conflicts: Assignment[] }> {
    return this.requestOrMock(
      async () => {
        const { data } = await api.get<{ hasConflict?: boolean; conflicts?: AssignmentApiPayload[] }>(
          CONFLICTS_PATH,
          {
            params: { technicianId, startUtc, endUtc },
          },
        );

        return {
          hasConflict: Boolean(data?.hasConflict),
          conflicts: Array.isArray(data?.conflicts)
            ? data!.conflicts!.map(mapAssignment)
            : [],
        };
      },
      async () => {
        const start = new Date(startUtc).getTime();
        const end = new Date(endUtc).getTime();
        if (Number.isNaN(start) || Number.isNaN(end)) {
          return { hasConflict: false, conflicts: [] };
        }

        const conflicts = mockAssignments.filter((assignment) => {
          if (assignment.technicianId !== technicianId) return false;
          if (!assignment.startUtc || !assignment.endUtc) return false;

          const existingStart = new Date(assignment.startUtc).getTime();
          const existingEnd = new Date(assignment.endUtc).getTime();

          if (Number.isNaN(existingStart) || Number.isNaN(existingEnd)) return false;
          return existingStart < end && existingEnd > start;
        });

        return {
          hasConflict: conflicts.length > 0,
          conflicts,
        };
      },
    );
  }
}

export const assignmentService = new AssignmentService();

export default assignmentService;
