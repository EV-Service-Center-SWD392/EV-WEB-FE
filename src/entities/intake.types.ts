/**
 * Service Intake & EV Checklist Types
 * Updated to match API specification
 * API Documentation: Service Intake API - http://localhost:5020/api/ServiceIntake
 */

export type IntakeStatus =
    | 'CHECKED_IN'
    | 'INSPECTING'
    | 'VERIFIED'
    | 'FINALIZED'
    | 'CANCELLED';

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
    centerId?: string;
    vehicleId?: string;
    technicianId?: string;
    assignmentId?: string | null;
    bookingId?: string | null;
    odometer?: number | null;
    batteryPercent?: number | null;
    status: IntakeStatus;
    createdAt: string;
    updatedAt?: string | null;
    // Extended fields for UI display (may not come from API)
    bookingCode?: string;
    serviceCenterName?: string;
    walkIn?: boolean;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    vehicleType?: string;
    licensePlate?: string;
    photos?: IntakePhoto[];
    notes?: string;
    arrivalNotes?: string;
    scheduledDate?: string;
    checklistInitializedAt?: string;
    verifiedBy?: string;
    verifiedAt?: string;
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
    bookingId: string; // Required - Guid of approved booking
    odometer?: number | null; // Optional - km reading
    batteryPercent?: number | null; // Optional - battery percentage 0-100
}

export interface UpdateIntakeRequest {
    odometer?: number | null;
    batteryPercent?: number | null; // 0-100
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
