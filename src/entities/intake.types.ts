/**
 * Service Intake & EV Checklist Types
 * Based on SWD_ThanhThao_Rule.txt - Section B3
 */

export type IntakeStatus = 'Draft' | 'Completed';

export type ChecklistItemType = 'Bool' | 'Number' | 'Text';

export type ChecklistCategory =
    | 'Exterior'
    | 'Tires'
    | 'Battery'
    | 'Electrical'
    | 'Safety';

export type SeverityLevel = 'Low' | 'Medium' | 'High';

export interface ServiceIntake {
    id: string;
    bookingId: string;
    odometer?: number;
    batterySoC?: number;
    photos?: IntakePhoto[];
    notes?: string;
    status: IntakeStatus;
    createdAt: string;
    updatedAt?: string;
}

export interface IntakePhoto {
    id: string;
    url: string;
    name: string;
    uploadedAt?: string;
}

export interface ChecklistItem {
    id: string;
    category: ChecklistCategory;
    label: string;
    description?: string;
    type: ChecklistItemType;
    order: number;
    isRequired?: boolean;
    isActive: boolean;
    createdAt?: string;
}

export interface ChecklistResponse {
    id?: string;
    checklistItemId: string;
    boolValue?: boolean;
    numberValue?: number;
    textValue?: string;
    severity?: SeverityLevel;
    note?: string;
    photoUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ChecklistResponseWithItem extends ChecklistResponse {
    item?: ChecklistItem;
}

// Request/Response DTOs

export interface CreateIntakeRequest {
    odometer?: number;
    batterySoC?: number;
    notes?: string;
    photos?: string[]; // URLs
}

export interface UpdateIntakeRequest {
    odometer?: number;
    batterySoC?: number;
    notes?: string;
    photos?: string[];
    status?: IntakeStatus;
}

export interface SaveChecklistResponsesRequest {
    responses: Array<{
        checklistItemId: string;
        boolValue?: boolean;
        numberValue?: number;
        textValue?: string;
        severity?: SeverityLevel;
        note?: string;
        photoUrl?: string;
    }>;
}

export interface IntakeWithResponses extends ServiceIntake {
    responses?: ChecklistResponse[];
    checklist?: ChecklistItem[];
}

// Grouped data for UI
export interface ChecklistByCategory {
    category: ChecklistCategory;
    items: ChecklistItem[];
}

export interface ChecklistResponseMap {
    [checklistItemId: string]: ChecklistResponse;
}
