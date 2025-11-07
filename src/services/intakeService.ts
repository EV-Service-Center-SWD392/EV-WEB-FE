/**
 * Service Intake API Client
 * API Documentation: http://localhost:5020/api/ServiceIntake
 * 
 * Workflow:
 * CHECKED_IN → INSPECTING → VERIFIED → FINALIZED
 *            ↓                      
 *         CANCELLED (only from CHECKED_IN or INSPECTING)
 */

import type {
  ChecklistItem,
  ChecklistResponse,
  CreateIntakeRequest,
  IntakeStatus,
  IntakeWithResponses,
  SaveChecklistResponsesRequest,
  ServiceIntake,
  UpdateIntakeRequest,
} from "@/entities/intake.types";

import { api } from "./api";

// API Endpoints - matching backend ServiceIntakeController
const BASE_PATH = "/api/ServiceIntake";
const CHECKLIST_ITEMS_PATH = "/api/checklist-items";
const UPLOAD_INTAKE_PHOTO_PATH = "/api/uploads/intake-photos";
const UPLOAD_CHECKLIST_PHOTO_PATH = "/api/uploads/checklist-photos";

// API response type
type IntakeApiResponse = {
  id: string;
  centerId?: string;
  vehicleId?: string;
  technicianId?: string;
  assignmentId?: string | null;
  bookingId?: string | null;
  odometer?: number | null;
  batteryPercent?: number | null;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
};

// Status mapping from backend to frontend
const statusMap: Record<string, IntakeStatus> = {
  "CHECKED_IN": "CHECKED_IN",
  "INSPECTING": "INSPECTING",
  "VERIFIED": "VERIFIED",
  "FINALIZED": "FINALIZED",
  "CANCELLED": "CANCELLED",
  // Fallback for lowercase
  "checked_in": "CHECKED_IN",
  "inspecting": "INSPECTING",
  "verified": "VERIFIED",
  "finalized": "FINALIZED",
  "cancelled": "CANCELLED",
};

const normalizeStatus = (status?: string): IntakeStatus => {
  if (!status) return "CHECKED_IN";
  return statusMap[status] || status as IntakeStatus;
};

const mapIntakeResponse = (data: IntakeApiResponse): ServiceIntake => {
  return {
    id: data.id,
    centerId: data.centerId,
    vehicleId: data.vehicleId,
    technicianId: data.technicianId,
    assignmentId: data.assignmentId,
    bookingId: data.bookingId,
    odometer: data.odometer,
    batteryPercent: data.batteryPercent,
    status: normalizeStatus(data.status),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

/**
 * List all service intakes with optional filters
 * GET /api/ServiceIntake?centerId={centerId}&date={date}&status={status}&technicianId={technicianId}
 */
export async function listIntakes(filters: {
  centerId?: string;
  date?: string; // Format: YYYY-MM-DD
  status?: string;
  technicianId?: string;
} = {}): Promise<ServiceIntake[]> {
  const params = new URLSearchParams();
  if (filters.centerId) params.append('centerId', filters.centerId);
  if (filters.date) params.append('date', filters.date);
  if (filters.status) params.append('status', filters.status);
  if (filters.technicianId) params.append('technicianId', filters.technicianId);

  const { data } = await api.get<IntakeApiResponse[]>(BASE_PATH, { params });
  return Array.isArray(data) ? data.map(mapIntakeResponse) : [];
}

/**
 * Create a new intake for an existing booking
 * POST /api/ServiceIntake
 */
export async function createIntake(request: CreateIntakeRequest): Promise<ServiceIntake> {
  const { data } = await api.post<IntakeApiResponse>(BASE_PATH, request);
  return mapIntakeResponse(data);
}

/**
 * Get intake by ID
 * GET /api/ServiceIntake/{id}
 */
export async function getIntake(intakeId: string): Promise<ServiceIntake> {
  const { data } = await api.get<IntakeApiResponse>(`${BASE_PATH}/${intakeId}`);
  return mapIntakeResponse(data);
}

/**
 * Update an existing intake (updates odometer and/or batteryPercent)
 * PUT /api/ServiceIntake/{id}
 * Auto transitions from CHECKED_IN → INSPECTING on first update
 */
export async function updateIntake(intakeId: string, request: UpdateIntakeRequest): Promise<ServiceIntake> {
  const { data } = await api.put<IntakeApiResponse>(`${BASE_PATH}/${intakeId}`, request);
  return mapIntakeResponse(data);
}

/**
 * Verify an intake (transition: INSPECTING → VERIFIED)
 * PUT /api/ServiceIntake/{id}/verify
 */
export async function verifyIntake(intakeId: string): Promise<ServiceIntake> {
  const { data } = await api.put<IntakeApiResponse>(`${BASE_PATH}/${intakeId}/verify`);
  return mapIntakeResponse(data);
}

/**
 * Finalize an intake (transition: VERIFIED → FINALIZED)
 * PUT /api/ServiceIntake/{id}/finalize
 */
export async function finalizeIntake(intakeId: string): Promise<ServiceIntake> {
  const { data } = await api.put<IntakeApiResponse>(`${BASE_PATH}/${intakeId}/finalize`);
  return mapIntakeResponse(data);
}

/**
 * Cancel an intake (transition: CHECKED_IN/INSPECTING → CANCELLED)
 * PUT /api/ServiceIntake/{id}/cancel
 */
export async function cancelIntake(intakeId: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.put<{ success: boolean; message: string }>(`${BASE_PATH}/${intakeId}/cancel`);
  return data;
}

/**
 * Get all checklist items (template)
 * GET /api/checklist-items
 */
export async function getChecklistItems(): Promise<ChecklistItem[]> {
  const { data } = await api.get<ChecklistItem[]>(CHECKLIST_ITEMS_PATH);
  return data;
}

/**
 * Get checklist responses for an intake
 * GET /api/ServiceIntake/{id}/responses
 */
export async function getChecklistResponses(intakeId: string): Promise<ChecklistResponse[]> {
  const { data } = await api.get<ChecklistResponse[]>(`${BASE_PATH}/${intakeId}/responses`);
  return data;
}

/**
 * Save checklist responses
 * POST /api/ServiceIntake/{id}/responses
 */
export async function saveChecklistResponses(
  intakeId: string,
  data: SaveChecklistResponsesRequest,
): Promise<ChecklistResponse[]> {
  const { data: response } = await api.post<ChecklistResponse[]>(`${BASE_PATH}/${intakeId}/responses`, data);
  return response;
}

export async function getIntakeWithResponses(intakeId: string): Promise<IntakeWithResponses> {
  const [intake, responses, checklist] = await Promise.all([
    getIntake(intakeId),
    getChecklistResponses(intakeId),
    getChecklistItems(),
  ]);

  return {
    ...intake,
    responses,
    checklist,
  };
}

export async function uploadIntakePhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<{ url: string }>(UPLOAD_INTAKE_PHOTO_PATH, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.url;
}

export async function uploadChecklistPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<{ url: string }>(UPLOAD_CHECKLIST_PHOTO_PATH, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.url;
}
