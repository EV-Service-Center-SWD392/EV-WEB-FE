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

const BASE_PATH = "/api/intakes";
const BOOKINGS_BASE_PATH = "/api/bookings";
const CHECKLIST_ITEMS_PATH = "/api/checklist-items";
const UPLOAD_INTAKE_PHOTO_PATH = "/api/uploads/intake-photos";
const UPLOAD_CHECKLIST_PHOTO_PATH = "/api/uploads/checklist-photos";
const USE_MOCK_DATA = false;

const mockIntakes: ServiceIntake[] = [
  {
    id: "intake-001",
    bookingId: "booking-001",
    bookingCode: "BK-001",
    serviceCenterName: "EV Service Center - Quận 1",
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    vehicleBrand: "VinFast",
    vehicleType: "VF8",
    licensePlate: "51A-12345",
    odometer: 15000,
    batterySoC: 85,
    status: "Checked_In",
    scheduledDate: "2024-01-15T09:00:00Z",
    createdAt: "2024-01-15T08:30:00Z",
    arrivalNotes: "Khách báo xe cảnh báo pin",
  },
  {
    id: "intake-002",
    bookingId: "booking-002",
    bookingCode: "BK-002",
    serviceCenterName: "EV Service Center - Quận 7",
    customerName: "Trần Thị B",
    customerPhone: "0912345678",
    vehicleBrand: "Tesla",
    vehicleType: "Model 3",
    licensePlate: "30B-98765",
    odometer: 28000,
    batterySoC: 72,
    status: "Finalized",
    scheduledDate: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-15T09:45:00Z",
    notes: "Đã hoàn tất kiểm tra phanh",
  },
  {
    id: "intake-003",
    bookingId: "booking-003",
    bookingCode: "BK-003",
    serviceCenterName: "EV Service Center - Thủ Đức",
    customerName: "Lê Văn C",
    customerPhone: "0923456789",
    vehicleBrand: "VinFast",
    vehicleType: "VF9",
    licensePlate: "59C-45678",
    odometer: 8500,
    batterySoC: 90,
    status: "Inspecting",
    scheduledDate: "2024-01-15T14:00:00Z",
    createdAt: "2024-01-15T13:30:00Z",
  },
  {
    id: "intake-004",
    bookingId: "booking-004",
    bookingCode: "BK-004",
    serviceCenterName: "EV Service Center - Quận 1",
    customerName: "Phạm Thị D",
    customerPhone: "0934567890",
    vehicleBrand: "Hyundai",
    vehicleType: "Kona EV",
    licensePlate: "51D-11223",
    odometer: 42000,
    batterySoC: 65,
    status: "Verified",
    scheduledDate: "2024-01-15T15:30:00Z",
    createdAt: "2024-01-15T15:00:00Z",
  },
  {
    id: "intake-005",
    walkIn: true,
    customerName: "Hoàng Văn E",
    customerPhone: "0945678901",
    vehicleBrand: "VinFast",
    vehicleType: "VF e34",
    licensePlate: "29E-55667",
    status: "Checked_In",
    createdAt: "2024-01-16T08:45:00Z",
    scheduledDate: "2024-01-16T09:00:00Z",
  },
];

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
      coerceIso(payload.scheduledDate) ??
      coerceIso(payload.booking?.preferredTime) ??
      coerceIso(payload.booking?.scheduledDate),
    checklistInitializedAt: coerceIso(payload.checklistInitializedAt),
    verifiedAt: coerceIso(payload.verifiedAt),
    verifiedBy: payload.verifiedBy as string | undefined,
    status: normalizeIntakeStatus(payload.status as string | IntakeStatus),
    createdAt: coerceIso(payload.createdAt) ?? new Date().toISOString(),
    updatedAt: coerceIso(payload.updatedAt),
  };
};

const filterMockIntakes = (filters: { status?: IntakeStatus; search?: string }) => {
  const { status, search } = filters;
  return mockIntakes.filter((intake) => {
    if (status && intake.status !== status) return false;
    if (search) {
      const query = search.toLowerCase();
      const haystack = [
        intake.bookingCode,
        intake.bookingId,
        intake.customerName,
        intake.customerPhone,
        intake.licensePlate,
        intake.serviceCenterName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
};

const requestOrMock = async <T>(executor: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> => {
  if (USE_MOCK_DATA) return fallback();
  try {
    return await executor();
  } catch (error) {
    console.warn("[intakeService] Falling back to mock data", error);
    return fallback();
  }
};

export async function listIntakes(filters: { status?: IntakeStatus | "all"; search?: string } = {}): Promise<ServiceIntake[]> {
  const normalizedFilters = {
    status: filters.status && filters.status !== "all" ? (filters.status as IntakeStatus) : undefined,
    search: filters.search?.trim() || undefined,
  };

  return requestOrMock(async () => {
    const { data } = await api.get<ServiceIntake[] | { items?: IntakeApiPayload[] }>(BASE_PATH, {
      params: {
        status: normalizedFilters.status,
        search: normalizedFilters.search,
      },
    });

    const payload = Array.isArray(data) ? data : data.items ?? [];
    return payload.map((item) => ("status" in item ? (item as ServiceIntake) : mapIntake(item)));
  }, () => filterMockIntakes(normalizedFilters));
}

export async function createIntake(bookingId: string, data: CreateIntakeRequest): Promise<ServiceIntake> {
  return requestOrMock(async () => {
    const { data: response } = await api.post<IntakeApiPayload>(`${BOOKINGS_BASE_PATH}/${bookingId}/intakes`, data);
    return mapIntake(response);
  }, () => {
    const now = new Date().toISOString();
    const newIntake: ServiceIntake = {
      id: `intake-${Date.now()}`,
      bookingId,
      walkIn: false,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      vehicleBrand: data.vehicleBrand,
      vehicleType: data.vehicleType,
      vehicleModel: data.vehicleModel,
      licensePlate: data.licensePlate,
      odometer: data.odometer,
      batterySoC: data.batterySoC,
      arrivalNotes: data.arrivalNotes,
      notes: data.notes,
      status: "Checked_In",
      createdAt: now,
      updatedAt: now,
    };
    mockIntakes.unshift(newIntake);
    return newIntake;
  });
}

export async function createWalkInIntake(
  data: CreateIntakeRequest & { customerName: string; customerPhone: string },
): Promise<ServiceIntake> {
  return requestOrMock(async () => {
    const { data: response } = await api.post<IntakeApiPayload>(`${BASE_PATH}/walk-in`, data);
    return mapIntake(response);
  }, () => {
    const now = new Date().toISOString();
    const newIntake: ServiceIntake = {
      id: `intake-${Date.now()}`,
      walkIn: true,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      vehicleBrand: data.vehicleBrand,
      vehicleModel: data.vehicleModel,
      vehicleType: data.vehicleType,
      licensePlate: data.licensePlate,
      odometer: data.odometer,
      batterySoC: data.batterySoC,
      notes: data.notes,
      arrivalNotes: data.arrivalNotes,
      status: "Checked_In",
      createdAt: now,
      updatedAt: now,
    };
    mockIntakes.unshift(newIntake);
    return newIntake;
  });
}

export async function getIntake(intakeId: string): Promise<ServiceIntake> {
  return requestOrMock(async () => {
    const { data } = await api.get<IntakeApiPayload>(`${BASE_PATH}/${intakeId}`);
    return mapIntake(data);
  }, () => {
    const intake = mockIntakes.find((item) => item.id === intakeId);
    if (!intake) {
      throw new Error("Intake not found");
    }
    return intake;
  });
}

export async function getIntakeByBooking(bookingId: string): Promise<ServiceIntake | null> {
  return requestOrMock(async () => {
    const { data } = await api.get<IntakeApiPayload>(`${BOOKINGS_BASE_PATH}/${bookingId}/intakes`);
    return mapIntake(data);
  }, () => mockIntakes.find((item) => item.bookingId === bookingId) ?? null);
}

export async function updateIntake(intakeId: string, data: UpdateIntakeRequest): Promise<ServiceIntake> {
  return requestOrMock(async () => {
    const { data: response } = await api.put<IntakeApiPayload>(`${BASE_PATH}/${intakeId}`, data);
    return mapIntake(response);
  }, () => {
    const index = mockIntakes.findIndex((item) => item.id === intakeId);
    if (index === -1) {
      throw new Error("Intake not found");
    }

    mockIntakes[index] = {
      ...mockIntakes[index],
      ...data,
      updatedAt: new Date().toISOString(),
      status: (data.status as IntakeStatus | undefined) ?? mockIntakes[index].status,
    };

    return mockIntakes[index];
  });
}

export async function getChecklistItems(): Promise<ChecklistItem[]> {
  return requestOrMock(async () => {
    const { data } = await api.get<ChecklistItem[]>(CHECKLIST_ITEMS_PATH);
    return data;
  }, () => []);
}

export async function getChecklistResponses(intakeId: string): Promise<ChecklistResponse[]> {
  return requestOrMock(async () => {
    const { data } = await api.get<ChecklistResponse[]>(`${BASE_PATH}/${intakeId}/responses`);
    return data;
  }, () => []);
}

export async function saveChecklistResponses(
  intakeId: string,
  data: SaveChecklistResponsesRequest,
): Promise<ChecklistResponse[]> {
  return requestOrMock(async () => {
    const { data: response } = await api.post<ChecklistResponse[]>(`${BASE_PATH}/${intakeId}/responses`, data);
    return response;
  }, () => data.responses.map((item, index) => ({ ...item, id: item.checklistItemId ?? `${index}` })));
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

export async function finalizeIntake(intakeId: string): Promise<ServiceIntake> {
  return requestOrMock(async () => {
    const { data } = await api.patch<IntakeApiPayload>(`${BASE_PATH}/${intakeId}/finalize`);
    return mapIntake(data);
  }, () => {
    const index = mockIntakes.findIndex((item) => item.id === intakeId);
    if (index === -1) {
      throw new Error("Intake not found");
    }

    mockIntakes[index] = {
      ...mockIntakes[index],
      status: "Finalized",
      updatedAt: new Date().toISOString(),
    };

    return mockIntakes[index];
  });
}
