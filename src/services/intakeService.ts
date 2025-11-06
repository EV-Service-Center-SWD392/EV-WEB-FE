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
const BOOKINGS_BASE_PATH = "/api/bookings";
const CHECKLIST_ITEMS_PATH = "/api/checklist-items";
const UPLOAD_INTAKE_PHOTO_PATH = "/api/uploads/intake-photos";
const UPLOAD_CHECKLIST_PHOTO_PATH = "/api/uploads/checklist-photos";

type IntakeApiPayload = {
  [key: string]: unknown;
  id?: string;
  intakeId?: string;
  bookingId?: string;
  bookingCode?: string;
  booking?: { id?: string; code?: string; preferredTime?: string; scheduledDate?: string; serviceCenterName?: string };
  serviceCenterId?: string;
  serviceCenter?: { id?: string; name?: string };
  serviceCenterName?: string;
  walkIn?: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customer?: { name?: string; phone?: string; email?: string };
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleType?: string;
  vehicle?: { brand?: string; model?: string; type?: string; licensePlate?: string; odometer?: number; batterySoC?: number };
  licensePlate?: string;
  odometer?: number;
  batterySoC?: number;
  photos?: Array<string | { id?: string; url?: string; name?: string; uploadedAt?: string }>;
  notes?: string;
  intakeNotes?: string;
  arrivalNotes?: string;
  arrival_notes?: string;
  status?: IntakeStatus | string;
  createdAt?: string;
  updatedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  checklistInitializedAt?: string;
};

const intakeStatusMap: Record<string, IntakeStatus> = {
  checked_in: "Checked_In",
  inspecting: "Inspecting",
  verified: "Verified",
  finalized: "Finalized",
  cancelled: "Cancelled",
  canceled: "Cancelled",
};

const normalizeIntakeStatus = (value?: string | IntakeStatus): IntakeStatus => {
  if (!value) return "Checked_In";
  if (typeof value !== "string") return value;
  const key = value.toLowerCase().replace(/\s+/g, "_");
  return intakeStatusMap[key] ?? (value as IntakeStatus);
};

const coerceIso = (value?: string): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const mapIntake = (payload: IntakeApiPayload): ServiceIntake => {
  const photos = Array.isArray(payload.photos)
    ? payload.photos.map((photo, index) =>
      typeof photo === "string"
        ? {
          id: `${index}`,
          url: photo,
          name: `photo-${index + 1}`,
        }
        : {
          id: photo.id ?? `${index}`,
          url: photo.url ?? "",
          name: photo.name ?? `photo-${index + 1}`,
          uploadedAt: coerceIso(photo.uploadedAt),
        },
    )
    : undefined;

  return {
    id: payload.id ?? payload.intakeId ?? `intake-${Date.now()}`,
    bookingId: payload.bookingId ?? payload.booking?.id,
    bookingCode: payload.bookingCode ?? payload.booking?.code,
    serviceCenterId: payload.serviceCenterId ?? payload.serviceCenter?.id,
    serviceCenterName:
      payload.serviceCenterName ?? payload.serviceCenter?.name ?? payload.booking?.serviceCenterName,
    walkIn: payload.walkIn ?? !payload.bookingId,
    customerName: payload.customerName ?? payload.customer?.name,
    customerPhone: payload.customerPhone ?? payload.customer?.phone,
    customerEmail: payload.customerEmail ?? payload.customer?.email,
    vehicleBrand: payload.vehicleBrand ?? payload.vehicle?.brand,
    vehicleModel: payload.vehicleModel ?? payload.vehicle?.model,
    vehicleType: payload.vehicleType ?? payload.vehicle?.type,
    licensePlate: payload.licensePlate ?? payload.vehicle?.licensePlate,
    odometer: payload.odometer ?? payload.vehicle?.odometer,
    batterySoC: payload.batterySoC ?? payload.vehicle?.batterySoC,
    photos,
    notes: payload.notes ?? payload.intakeNotes,
    arrivalNotes: payload.arrivalNotes ?? payload.arrival_notes,
    scheduledDate:
      coerceIso(payload.scheduledDate as string | undefined) ??
      coerceIso(payload.booking?.preferredTime as string | undefined) ??
      coerceIso(payload.booking?.scheduledDate as string | undefined),
    checklistInitializedAt: coerceIso(payload.checklistInitializedAt as string | undefined),
    verifiedAt: coerceIso(payload.verifiedAt as string | undefined),
    verifiedBy: payload.verifiedBy as string | undefined,
    status: normalizeIntakeStatus(payload.status as string | IntakeStatus),
    createdAt: coerceIso(payload.createdAt as string | undefined) ?? new Date().toISOString(),
    updatedAt: coerceIso(payload.updatedAt as string | undefined),
  };
};

/**
 * List all service intakes with optional filters
 * GET /api/ServiceIntake?centerId=...&date=...&status=...&technicianId=...
 */
export async function listIntakes(filters: { status?: IntakeStatus | "all"; search?: string } = {}): Promise<ServiceIntake[]> {
  const normalizedStatus = filters.status && filters.status !== "all" ? filters.status : undefined;

  const { data } = await api.get<ServiceIntake[] | { items?: IntakeApiPayload[] }>(BASE_PATH, {
    params: {
      status: normalizedStatus,
      // Note: Backend doesn't support search param yet, filtering will be done client-side if needed
    },
  });

  const payload = Array.isArray(data) ? data : data.items ?? [];
  return payload.map((item) => ("status" in item ? (item as ServiceIntake) : mapIntake(item)));
}

/**
 * Create a new intake for an existing booking
 * POST /api/ServiceIntake
 */
export async function createIntake(bookingId: string, data: CreateIntakeRequest): Promise<ServiceIntake> {
  const { data: response } = await api.post<IntakeApiPayload>(BASE_PATH, {
    ...data,
    bookingId,
  });
  return mapIntake(response);
}

/**
 * Create a walk-in intake (no booking)
 * POST /api/ServiceIntake
 */
export async function createWalkInIntake(
  data: CreateIntakeRequest & { customerName: string; customerPhone: string },
): Promise<ServiceIntake> {
  const { data: response } = await api.post<IntakeApiPayload>(BASE_PATH, {
    ...data,
    walkIn: true,
  });
  return mapIntake(response);
}

/**
 * Get intake by ID
 * GET /api/ServiceIntake/{id}
 */
export async function getIntake(intakeId: string): Promise<ServiceIntake> {
  const { data } = await api.get<IntakeApiPayload>(`${BASE_PATH}/${intakeId}`);
  return mapIntake(data);
}

/**
 * Get intake by booking ID
 * GET /api/bookings/{bookingId}/intakes
 */
export async function getIntakeByBooking(bookingId: string): Promise<ServiceIntake | null> {
  try {
    const { data } = await api.get<IntakeApiPayload>(`${BOOKINGS_BASE_PATH}/${bookingId}/intakes`);
    return mapIntake(data);
  } catch {
    // Return null if intake doesn't exist for this booking yet
    return null;
  }
}

/**
 * Update an existing intake
 * PUT /api/ServiceIntake/{id}
 */
export async function updateIntake(intakeId: string, data: UpdateIntakeRequest): Promise<ServiceIntake> {
  const { data: response } = await api.put<IntakeApiPayload>(`${BASE_PATH}/${intakeId}`, data);
  return mapIntake(response);
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

/**
 * Start inspecting (transition: CHECKED_IN → INSPECTING)
 * PUT /api/ServiceIntake/{id}
 */
export async function startInspecting(intakeId: string): Promise<ServiceIntake> {
  const { data } = await api.put<IntakeApiPayload>(`${BASE_PATH}/${intakeId}`, {
    status: "Inspecting",
  });
  return mapIntake(data);
}

/**
 * Verify an intake (transition: INSPECTING → VERIFIED)
 * PUT /api/ServiceIntake/{id}/verify
 */
export async function verifyIntake(intakeId: string): Promise<ServiceIntake> {
  const { data } = await api.put<IntakeApiPayload>(`${BASE_PATH}/${intakeId}/verify`);
  return mapIntake(data);
}

/**
 * Finalize an intake (transition: VERIFIED → FINALIZED)
 * PUT /api/ServiceIntake/{id}/finalize
 */
export async function finalizeIntake(intakeId: string): Promise<ServiceIntake> {
  const { data } = await api.put<IntakeApiPayload>(`${BASE_PATH}/${intakeId}/finalize`);
  return mapIntake(data);
}

/**
 * Cancel an intake (transition: CHECKED_IN → CANCELLED)
 * PUT /api/ServiceIntake/{id}/cancel
 */
export async function cancelIntake(intakeId: string): Promise<ServiceIntake> {
  const { data } = await api.put<IntakeApiPayload>(`${BASE_PATH}/${intakeId}/cancel`);
  return mapIntake(data);
}
