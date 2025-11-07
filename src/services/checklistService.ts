/**
 * Checklist Service
 * Handles all API calls for EV Checklist Management
 */

import type {
    ChecklistItem,
    ChecklistResponseWithItem,
    SaveChecklistResponsesRequest,
} from '@/entities/intake.types';

import { api } from './api';

const CHECKLIST_ITEMS_BASE = '/api/Checklist/items';
const CHECKLIST_RESPONSES_BASE = '/api/Checklist';

/**
 * Get all available checklist items (catalog)
 * GET /api/Checklist/items
 */
export async function getChecklistItems(): Promise<ChecklistItem[]> {
    const response = await api.get<ChecklistItem[]>(CHECKLIST_ITEMS_BASE);
    return response.data;
}

/**
 * Get checklist responses for a specific intake
 * GET /api/Checklist/{intakeId}/responses
 */
export async function getChecklistResponses(
    intakeId: string
): Promise<ChecklistResponseWithItem[]> {
    const response = await api.get<ChecklistResponseWithItem[]>(
        `${CHECKLIST_RESPONSES_BASE}/${intakeId}/responses`
    );
    return response.data;
}

/**
 * Save/Update checklist responses for an intake
 * PUT /api/Checklist/{intakeId}/responses
 * This will update intake status:
 * - CHECKED_IN -> INSPECTING (on first save)
 * - INSPECTING -> FINALIZED (when complete)
 */
export async function saveChecklistResponses(
    intakeId: string,
    responses: SaveChecklistResponsesRequest
): Promise<ChecklistResponseWithItem[]> {
    const response = await api.put<ChecklistResponseWithItem[]>(
        `${CHECKLIST_RESPONSES_BASE}/${intakeId}/responses`,
        responses
    );
    return response.data;
}

/**
 * Upload photo for checklist item
 * POST /api/uploads/checklist-photos
 */
export async function uploadChecklistPhoto(
    intakeId: string,
    checklistItemId: string,
    file: File
): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('intakeId', intakeId);
    formData.append('checklistItemId', checklistItemId);

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

export const checklistService = {
    getChecklistItems,
    getChecklistResponses,
    saveChecklistResponses,
    uploadChecklistPhoto,
};
