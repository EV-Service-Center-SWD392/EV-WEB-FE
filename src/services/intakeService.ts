/**
 * Service Intake API Service
 * Handles all API calls for Service Intake & EV Checklist
 */

import type {
    ServiceIntake,
    ChecklistItem,
    ChecklistResponse,
    CreateIntakeRequest,
    UpdateIntakeRequest,
    SaveChecklistResponsesRequest,
    IntakeWithResponses,
} from '@/entities/intake.types';

import { api } from './api';

/**
 * Create a new service intake for a booking
 * POST /api/bookings/{bookingId}/intakes
 */
export async function createIntake(
    bookingId: string,
    data: CreateIntakeRequest
): Promise<ServiceIntake> {
    const response = await api.post<ServiceIntake>(
        `/api/bookings/${bookingId}/intakes`,
        data
    );
    return response.data;
}

/**
 * Get intake detail by ID
 * GET /api/intakes/{intakeId}
 */
export async function getIntake(intakeId: string): Promise<ServiceIntake> {
    const response = await api.get<ServiceIntake>(`/api/intakes/${intakeId}`);
    return response.data;
}

/**
 * Get intake by booking ID
 * GET /api/bookings/{bookingId}/intakes
 */
export async function getIntakeByBooking(
    bookingId: string
): Promise<ServiceIntake | null> {
    try {
        const response = await api.get<ServiceIntake>(
            `/api/bookings/${bookingId}/intakes`
        );
        return response.data;
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 404) {
                return null;
            }
        }
        throw error;
    }
}

/**
 * Update an existing intake
 * PUT /api/intakes/{intakeId}
 */
export async function updateIntake(
    intakeId: string,
    data: UpdateIntakeRequest
): Promise<ServiceIntake> {
    const response = await api.put<ServiceIntake>(
        `/api/intakes/${intakeId}`,
        data
    );
    return response.data;
}

/**
 * Get all active checklist items
 * GET /api/checklist-items
 */
export async function getChecklistItems(): Promise<ChecklistItem[]> {
    const response = await api.get<ChecklistItem[]>('/api/checklist-items');
    return response.data;
}

/**
 * Get checklist responses for an intake
 * GET /api/intakes/{intakeId}/responses
 */
export async function getChecklistResponses(
    intakeId: string
): Promise<ChecklistResponse[]> {
    const response = await api.get<ChecklistResponse[]>(
        `/api/intakes/${intakeId}/responses`
    );
    return response.data;
}

/**
 * Save checklist responses (create or update)
 * POST /api/intakes/{intakeId}/responses
 */
export async function saveChecklistResponses(
    intakeId: string,
    data: SaveChecklistResponsesRequest
): Promise<ChecklistResponse[]> {
    const response = await api.post<ChecklistResponse[]>(
        `/api/intakes/${intakeId}/responses`,
        data
    );
    return response.data;
}

/**
 * Get intake with checklist responses (composite)
 * Combines intake + responses in one call
 */
export async function getIntakeWithResponses(
    intakeId: string
): Promise<IntakeWithResponses> {
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

/**
 * Upload photo for intake
 * POST /api/uploads/intake-photos
 */
export async function uploadIntakePhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ url: string }>(
        '/api/uploads/intake-photos',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data.url;
}

/**
 * Upload photo for checklist response
 * POST /api/uploads/checklist-photos
 */
export async function uploadChecklistPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ url: string }>(
        '/api/uploads/checklist-photos',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data.url;
}

/**
 * Finalize intake (mark as Completed)
 * PATCH /api/intakes/{intakeId}/finalize
 */
export async function finalizeIntake(intakeId: string): Promise<ServiceIntake> {
    const response = await api.patch<ServiceIntake>(
        `/api/intakes/${intakeId}/finalize`
    );
    return response.data;
}
