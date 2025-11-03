/**
 * BookingApproval types based on API:
 * Base URL: https://{host}/api/BookingApproval
 * Requires [Authorize(Roles = "STAFF,ADVISOR")]
 */

export type UUID = string;

export type BookingApprovalStatus =
    | "PENDING"
    | "REQUESTED"
    | "APPROVED"
    | "REJECTED";

export interface BookingApprovalDto {
    id: UUID;
    centerId?: UUID;
    customerId: UUID;
    vehicleId: UUID;
    serviceTypeId?: UUID;
    preferredStartUtc?: string; // ISO 8601 UTC string
    preferredEndUtc?: string; // ISO 8601 UTC string
    status: BookingApprovalStatus;
    approvedBy?: UUID;
    approvedAt?: string;
    rejectedBy?: UUID;
    rejectedAt?: string;
    rejectReason?: string;
    createdAt?: string;
}

export interface ApproveBookingDto {
    bookingId: UUID;
    note?: string;
}

export interface RejectBookingDto {
    bookingId: UUID;
    reason: string; // Required
}

export interface BookingApprovalFilters {
    centerId?: UUID;
    date?: string; // YYYY-MM-DD format
}
