export type UUID = string;

export type AssignmentStatus =
    | 'Pending'
    | 'Assigned'
    | 'InQueue'
    | 'In_Queue'
    | 'Active'
    | 'Completed'
    | 'Reassigned'
    | 'Cancelled'
    | 'CancelledByCustomer';

export interface Assignment {
    id: UUID;
    centerId: UUID;
    technicianId: UUID;
    // Liên kết tới nguồn công việc:
    // one of: bookingId OR serviceRequestId (chỉ một)
    bookingId?: UUID;
    serviceRequestId?: UUID;
    startUtc?: string;
    endUtc?: string;
    status: AssignmentStatus;
    note?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateAssignmentDTO {
    centerId: UUID;
    technicianId: UUID;
    bookingId?: UUID;          // nếu gán cho booking đã có
    serviceRequestId?: UUID;   // nếu gán cho request (chưa booking)
    plannedStartUtc?: string;  // optional, chỉ gợi ý
    note?: string;
}

export interface UpdateAssignmentDTO {
    status?: AssignmentStatus;
    startUtc?: string;
    endUtc?: string;
    note?: string;
}

export interface AssignmentFilters {
    centerId?: UUID;
    technicianId?: UUID;
    date?: string;  // YYYY-MM-DD
    status?: AssignmentStatus;
}
