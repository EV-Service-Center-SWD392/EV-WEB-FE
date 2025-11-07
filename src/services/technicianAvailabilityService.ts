import { api } from "./api";

/**
 * ============================================
 * TECHNICIAN AVAILABILITY SERVICE
 * ============================================
 * 
 * This service fetches available technicians for a booking using:
 * 1. GET /api/UserWorkSchedule/technicians-schedules - Get all technicians with schedules
 * 2. Filter technicians by matching schedule with booking info (center, date, time overlap)
 * 3. GET /api/Assignment/range - Get existing assignments to check conflicts (OPTIONAL - fallback if API fails)
 * 
 * Note: Assignment check is wrapped in try-catch to handle backend issues gracefully
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface BookingInfo {
    centerId?: string;
    centerName: string;
    bookingDate: string; // Format: "2025-11-10"
    startTime: string; // Format: "13:30:00"
    endTime: string; // Format: "15:30:00"
}

export interface WorkSchedule {
    userWorkScheduleId?: string;
    workScheduleId: string;
    startTime: string; // ISO datetime: "2025-11-10T07:00:00Z"
    endTime: string; // ISO datetime: "2025-11-10T12:00:00Z"
    centerName: string;
    status: string; // "Active", "Inactive", etc.
    createdAt?: string;
}

export interface TechnicianWithSchedules {
    userId: string;
    userName: string;
    email: string;
    phoneNumber?: string;
    schedules: WorkSchedule[];
}

export interface ExistingAssignment {
    id: string;
    technicianId: string;
    bookingId?: string;
    plannedStartUtc: string; // ISO datetime
    plannedEndUtc: string; // ISO datetime
    status: string;
}

export interface AvailableTechnician {
    userId: string;
    userName: string;
    email: string;
    phoneNumber?: string;
    bookingContext: {
        centerName: string;
        bookingDate: string;
        timeSlot: string;
    };
    matchingSchedules: WorkSchedule[];
}

// ============================================
// MAIN SERVICE
// ============================================

export const technicianAvailabilityService = {
    /**
     * Get available technicians for a booking
     * @param bookingInfo - Booking information extracted from booking data
     * @returns List of available technicians
     */
    async getAvailableTechnicians(
        bookingInfo: BookingInfo
    ): Promise<AvailableTechnician[]> {
        try {
            console.warn("🔍 BOOKING INFO:", {
                centerName: bookingInfo.centerName,
                bookingDate: bookingInfo.bookingDate,
                startTime: bookingInfo.startTime,
                endTime: bookingInfo.endTime,
            });

            // STEP 1: Get all technicians with work schedules
            const allTechnicians = await getAllTechniciansWithSchedules();

            if (allTechnicians.length === 0) {
                console.warn("⚠️ No technicians found in the system");
                return [];
            }

            // STEP 2: Filter technicians with matching schedules
            const techniciansWithSchedule = filterTechniciansBySchedule(
                allTechnicians,
                bookingInfo
            );

            if (techniciansWithSchedule.length === 0) {
                console.warn("⚠️ No technicians found with matching schedule");
                console.warn("📋 Debug info:");
                console.warn("  - Looking for center:", bookingInfo.centerName);
                console.warn("  - Looking for date:", bookingInfo.bookingDate);
                console.warn("  - Looking for time:", `${bookingInfo.startTime} - ${bookingInfo.endTime}`);

                if (allTechnicians.length > 0 && allTechnicians[0]?.schedules?.length > 0) {
                    const sampleSchedule = allTechnicians[0].schedules[0];
                    console.warn("  - Sample schedule from first tech:", {
                        centerName: sampleSchedule.centerName,
                        startTime: sampleSchedule.startTime,
                        endTime: sampleSchedule.endTime,
                        status: sampleSchedule.status
                    });

                    // Show all schedules from first tech for debugging
                    console.warn("  - All schedules from first tech:", allTechnicians[0].schedules.map(s => ({
                        center: s.centerName,
                        date: extractDate(s.startTime),
                        time: `${extractTime(s.startTime)} - ${extractTime(s.endTime)}`,
                        status: s.status
                    })));
                }

                return [];
            }            // STEP 3: Try to get existing assignments to check for conflicts
            // This is wrapped in try-catch to handle backend issues gracefully
            let availableTechnicians = techniciansWithSchedule;

            if (bookingInfo.centerId) {
                try {
                    const existingAssignments = await getExistingAssignments(
                        bookingInfo.centerId,
                        bookingInfo.bookingDate
                    );

                    if (existingAssignments.length > 0) {
                        // STEP 4: Filter out busy technicians
                        availableTechnicians = filterOutBusyTechnicians(
                            techniciansWithSchedule,
                            existingAssignments,
                            bookingInfo
                        );

                        console.warn(
                            `✅ Assignment check enabled: ${techniciansWithSchedule.length} → ${availableTechnicians.length} available`
                        );
                    }
                } catch (error) {
                    // If assignment API fails, continue without filtering
                    console.warn(
                        "⚠️ Assignment API unavailable, showing all technicians with matching schedule:",
                        error
                    );
                    // Keep all technicians with matching schedule
                    availableTechnicians = techniciansWithSchedule;
                }
            }

            // Add booking context to each technician
            return availableTechnicians.map((tech) => ({
                ...tech,
                bookingContext: {
                    centerName: bookingInfo.centerName,
                    bookingDate: bookingInfo.bookingDate,
                    timeSlot: `${bookingInfo.startTime} - ${bookingInfo.endTime}`,
                },
            }));
        } catch (error) {
            console.error("❌ Error in getAvailableTechnicians:", error);
            throw error;
        }
    },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all technicians with their work schedules
 * API: GET /api/UserWorkSchedule/technicians-schedules
 */
async function getAllTechniciansWithSchedules(): Promise<
    TechnicianWithSchedules[]
> {
    try {
        const response = await api.get<{
            isSuccess?: boolean;
            message?: string;
            data?: TechnicianWithSchedules[];
        }>("/api/UserWorkSchedule/technicians-schedules");

        console.warn("📡 API Response:", {
            status: response.status,
            hasIsSuccess: 'isSuccess' in (response.data || {}),
            isSuccess: response.data?.isSuccess,
            dataLength: response.data?.data?.length,
            message: response.data?.message,
            fullData: response.data,
        });

        // Handle both formats: { isSuccess, data } and direct array
        let technicians: TechnicianWithSchedules[] = [];

        if (response.data) {
            // Format 1: { isSuccess: true, data: [...] }
            if ('isSuccess' in response.data) {
                if (!response.data.isSuccess) {
                    const errorMsg = response.data.message || "API returned isSuccess: false";
                    console.error("❌ API Error:", errorMsg);
                    throw new Error(errorMsg);
                }
                technicians = response.data.data || [];
            }
            // Format 2: Direct array
            else if (Array.isArray(response.data)) {
                technicians = response.data;
            }
            // Format 3: { data: [...] } without isSuccess
            else if ('data' in response.data && Array.isArray(response.data.data)) {
                technicians = response.data.data;
            }
        }

        if (technicians.length === 0) {
            console.warn("⚠️ No technicians found in database. Please ensure:");
            console.warn("   1. Technicians exist in the system");
            console.warn("   2. Technicians have work schedules assigned");
            console.warn("   3. Work schedules are active");
        } else {
            console.warn(`✅ Fetched ${technicians.length} technicians`);
        }

        return technicians;
    } catch (error) {
        console.error("❌ Failed to fetch technicians:", {
            error,
            message: error instanceof Error ? error.message : "Unknown error",
            response: (error as { response?: { data?: unknown } })?.response?.data,
        });
        throw new Error("Failed to fetch technicians");
    }
}/**
 * Get existing assignments for a center and date
 * API: GET /api/Assignment/range
 * 
 * NOTE: This may fail if backend has issues. Errors are caught in the main service.
 */
async function getExistingAssignments(
    centerId: string,
    bookingDate: string
): Promise<ExistingAssignment[]> {
    const response = await api.get<{
        isSuccess: boolean;
        message?: string;
        data?: ExistingAssignment[];
    }>(
        `/api/Assignment/range?centerId=${centerId}&date=${bookingDate}&status=ASSIGNED,ACTIVE`
    );

    if (!response.data.isSuccess) {
        throw new Error(
            response.data.message || "Failed to fetch assignments"
        );
    }

    return response.data.data || [];
}

/**
 * Filter technicians by work schedule matching
 */
function filterTechniciansBySchedule(
    technicians: TechnicianWithSchedules[],
    bookingInfo: BookingInfo
): Array<TechnicianWithSchedules & { matchingSchedules: WorkSchedule[] }> {
    console.warn("🔍 Filtering technicians by schedule...");
    console.warn("  Total technicians to check:", technicians.length);

    return technicians
        .map((tech) => {
            // Check if technician has at least one matching schedule
            const matchingSchedules = tech.schedules.filter((schedule) => {
                // 1. Check center match
                const centerMatch = schedule.centerName === bookingInfo.centerName;

                // 2. Check date match
                const scheduleDate = extractDate(schedule.startTime);
                const dateMatch = scheduleDate === bookingInfo.bookingDate;

                // 3. Check status
                const statusMatch = schedule.status === "Active";

                // 4. Check time overlap
                const scheduleStart = new Date(
                    `${scheduleDate}T${extractTime(schedule.startTime)}`
                );
                const scheduleEnd = new Date(
                    `${scheduleDate}T${extractTime(schedule.endTime)}`
                );
                const bookingStart = new Date(
                    `${bookingInfo.bookingDate}T${bookingInfo.startTime}`
                );
                const bookingEnd = new Date(
                    `${bookingInfo.bookingDate}T${bookingInfo.endTime}`
                );

                // Has overlap if: scheduleStart <= bookingEnd AND scheduleEnd >= bookingStart
                const hasOverlap =
                    scheduleStart <= bookingEnd && scheduleEnd >= bookingStart;

                // Debug log for each schedule check
                if (!centerMatch || !dateMatch || !statusMatch || !hasOverlap) {
                    console.warn(`  ❌ Schedule mismatch for ${tech.userName}:`, {
                        centerMatch: centerMatch ? '✅' : `❌ (schedule: "${schedule.centerName}" !== booking: "${bookingInfo.centerName}")`,
                        dateMatch: dateMatch ? '✅' : `❌ (schedule: "${scheduleDate}" !== booking: "${bookingInfo.bookingDate}")`,
                        statusMatch: statusMatch ? '✅' : `❌ (status: "${schedule.status}" !== "Active")`,
                        hasOverlap: hasOverlap ? '✅' : `❌ (schedule: ${extractTime(schedule.startTime)}-${extractTime(schedule.endTime)} vs booking: ${bookingInfo.startTime}-${bookingInfo.endTime})`
                    });
                }

                return centerMatch && dateMatch && statusMatch && hasOverlap;
            });

            if (matchingSchedules.length > 0) {
                console.warn(`  ✅ Found ${matchingSchedules.length} matching schedule(s) for ${tech.userName}`);
            }

            return {
                ...tech,
                matchingSchedules,
            };
        })
        .filter((tech) => tech.matchingSchedules.length > 0);
}

/**
 * Filter out technicians who are already assigned (busy)
 * This prevents double-booking of technicians
 */
function filterOutBusyTechnicians(
    technicians: Array<
        TechnicianWithSchedules & { matchingSchedules: WorkSchedule[] }
    >,
    assignments: ExistingAssignment[],
    bookingInfo: BookingInfo
): Array<TechnicianWithSchedules & { matchingSchedules: WorkSchedule[] }> {
    // Get list of busy technician IDs
    const busyTechnicianIds = assignments
        .filter((assignment) => {
            // Check time overlap
            const assignStart = new Date(assignment.plannedStartUtc);
            const assignEnd = new Date(assignment.plannedEndUtc);
            const bookingStart = new Date(
                `${bookingInfo.bookingDate}T${bookingInfo.startTime}`
            );
            const bookingEnd = new Date(
                `${bookingInfo.bookingDate}T${bookingInfo.endTime}`
            );

            // Has overlap if assignment time intersects with booking time
            return assignStart < bookingEnd && assignEnd > bookingStart;
        })
        .map((assignment) => assignment.technicianId);

    // Filter out busy technicians
    return technicians.filter(
        (tech) => !busyTechnicianIds.includes(tech.userId)
    );
}

/**
 * Extract date from ISO datetime string
 * "2025-11-10T13:30:00Z" -> "2025-11-10"
 * "2025-11-10T07:00:00Z" -> "2025-11-10"
 */
function extractDate(dateTimeString: string): string {
    return dateTimeString.split("T")[0];
}

/**
 * Extract time from ISO datetime string
 * "2025-11-10T13:30:00Z" -> "13:30:00"
 */
function extractTime(dateTimeString: string): string {
    const timePart = dateTimeString.split("T")[1];
    return timePart.split("Z")[0].substring(0, 8); // Get HH:mm:ss
}

// ============================================
// ERROR HANDLING
// ============================================

export class TechnicianServiceError extends Error {
    code: string;

    constructor(message: string, code: string) {
        super(message);
        this.name = "TechnicianServiceError";
        this.code = code;
    }
}
