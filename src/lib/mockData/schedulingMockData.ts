/**
 * MOCK DATA for Scheduling & Queue Feature
 * 
 * ⚠️ FOR DEVELOPMENT ONLY - DELETE THIS FILE WHEN CONNECTING TO REAL API
 * 
 * This file contains mock data to help visualize the UI during development.
 * When ready to connect to real API, simply delete this file and the services
 * will use real API endpoints.
 * 
 * Usage:
 * import { mockCenters, mockTechnicians, mockAssignableWork, mockQueueTickets } from '@/lib/mockData/schedulingMockData';
 */

import type { Center, SlotCapacity, Technician } from "@/entities/slot.types";
import type { Assignment } from "@/entities/assignment.types";
import type { QueueTicket } from "@/entities/queue.types";
import type { AssignableWorkItem } from "@/hooks/scheduling/useAssignableWork";

// ============================================================================
// CENTERS (Service Centers)
// ============================================================================

export const mockCenters: Center[] = [
    {
        id: "center-1",
        name: "EV Service Center - Quận 1",
        address: "123 Nguyễn Huệ, Quận 1, TPHCM",
        capacity: 20,
    },
    {
        id: "center-2",
        name: "EV Service Center - Quận 7",
        address: "456 Nguyễn Văn Linh, Quận 7, TPHCM",
        capacity: 15,
    },
    {
        id: "center-3",
        name: "EV Service Center - Thủ Đức",
        address: "789 Võ Văn Ngân, Thủ Đức, TPHCM",
        capacity: 25,
    },
];

// ============================================================================
// TECHNICIANS (Kỹ thuật viên)
// ============================================================================

export const mockTechnicians: Technician[] = [
    {
        id: "tech-1",
        name: "Nguyễn Văn A",
        email: "nguyenvana@evservice.com",
        phone: "0901234567",
        centerId: "center-1",
        specialties: ["Battery", "Motor", "Charging System"],
        isActive: true,
    },
    {
        id: "tech-2",
        name: "Trần Thị B",
        email: "tranthib@evservice.com",
        phone: "0902345678",
        centerId: "center-1",
        specialties: ["Electrical", "Diagnostics"],
        isActive: true,
    },
    {
        id: "tech-3",
        name: "Lê Văn C",
        email: "levanc@evservice.com",
        phone: "0903456789",
        centerId: "center-1",
        specialties: ["Battery", "BMS", "Cooling System"],
        isActive: true,
    },
    {
        id: "tech-4",
        name: "Phạm Thị D",
        email: "phamthid@evservice.com",
        phone: "0904567890",
        centerId: "center-2",
        specialties: ["Motor", "Transmission", "Brake System"],
        isActive: true,
    },
    {
        id: "tech-5",
        name: "Hoàng Văn E",
        email: "hoangvane@evservice.com",
        phone: "0905678901",
        centerId: "center-2",
        specialties: ["Charging", "Electronics"],
        isActive: true,
    },
    {
        id: "tech-6",
        name: "Đỗ Thị F",
        email: "dothif@evservice.com",
        phone: "0906789012",
        centerId: "center-3",
        specialties: ["Battery", "Motor", "General Maintenance"],
        isActive: true,
    },
];

// ============================================================================
// SLOT CAPACITY (Công suất trung tâm)
// ============================================================================

export const mockSlotCapacity: Record<string, SlotCapacity> = {
    "center-1": {
        date: new Date().toISOString().split("T")[0],
        centerId: "center-1",
        capacity: 20,
        occupied: 12,
        available: 8,
    },
    "center-2": {
        date: new Date().toISOString().split("T")[0],
        centerId: "center-2",
        capacity: 15,
        occupied: 8,
        available: 7,
    },
    "center-3": {
        date: new Date().toISOString().split("T")[0],
        centerId: "center-3",
        capacity: 25,
        occupied: 18,
        available: 7,
    },
};

// ============================================================================
// ASSIGNABLE WORK ITEMS (Công việc có thể gán)
// ============================================================================

export const mockAssignableWork: AssignableWorkItem[] = [
    {
        id: "work-1",
        type: "booking",
        customerName: "Nguyễn Minh Hoàng",
        customerPhone: "0912345678",
        customerEmail: "hoang.nguyen@gmail.com",
        vehicleInfo: "VinFast VF8 (SUV điện)",
        services: "Bảo dưỡng định kỳ, Kiểm tra hệ thống pin",
        scheduledTime: `${new Date().toISOString().split("T")[0]}T09:00:00Z`,
        status: "confirmed",
        priority: 1,
        suggestedTechId: "tech-1",
    },
    {
        id: "work-2",
        type: "booking",
        customerName: "Trần Thị Lan Anh",
        customerPhone: "0923456789",
        customerEmail: "lananh.tran@gmail.com",
        vehicleInfo: "Tesla Model 3 (Sedan)",
        services: "Thay pin 12V, Cập nhật phần mềm",
        scheduledTime: `${new Date().toISOString().split("T")[0]}T10:30:00Z`,
        status: "confirmed",
        priority: 2,
    },
    {
        id: "work-3",
        type: "booking",
        customerName: "Lê Văn Dũng",
        customerPhone: "0934567890",
        customerEmail: "dung.le@yahoo.com",
        vehicleInfo: "Hyundai Kona Electric (SUV)",
        services: "Sửa chữa động cơ điện, Kiểm tra phanh",
        scheduledTime: `${new Date().toISOString().split("T")[0]}T11:00:00Z`,
        status: "confirmed",
        priority: 1,
        suggestedTechId: "tech-2",
    },
    {
        id: "work-4",
        type: "request",
        customerName: "Phạm Thị Mai",
        customerPhone: "0945678901",
        customerEmail: "mai.pham@outlook.com",
        vehicleInfo: "VinFast VF9 (SUV 7 chỗ)",
        services: "Bảo dưỡng 10,000 km",
        timeWindow: "Morning",
        status: "validated",
        priority: 3,
    },
    {
        id: "work-5",
        type: "booking",
        customerName: "Hoàng Văn Tuấn",
        customerPhone: "0956789012",
        customerEmail: "tuan.hoang@gmail.com",
        vehicleInfo: "Nissan Leaf (Hatchback)",
        services: "Thay lốp xe, Cân chỉnh bánh",
        scheduledTime: `${new Date().toISOString().split("T")[0]}T14:00:00Z`,
        status: "confirmed",
        priority: 2,
    },
    {
        id: "work-6",
        type: "request",
        customerName: "Đỗ Thị Hương",
        customerPhone: "0967890123",
        customerEmail: "huong.do@gmail.com",
        vehicleInfo: "BMW i3 (Hatchback)",
        services: "Kiểm tra tổng quát, Vệ sinh nội thất",
        timeWindow: "Afternoon",
        status: "validated",
        priority: 3,
    },
];

// ============================================================================
// ASSIGNMENTS (Công việc đã gán)
// ============================================================================

export const mockAssignments: Assignment[] = [
    {
        id: "assign-1",
        centerId: "center-1",
        technicianId: "tech-1",
        bookingId: "booking-1",
        startUtc: `${new Date().toISOString().split("T")[0]}T08:00:00Z`,
        endUtc: `${new Date().toISOString().split("T")[0]}T10:00:00Z`,
        status: "Started",
        note: "Priority customer - VIP service",
        createdAt: `${new Date().toISOString()}`,
    },
    {
        id: "assign-2",
        centerId: "center-1",
        technicianId: "tech-2",
        bookingId: "booking-2",
        startUtc: `${new Date().toISOString().split("T")[0]}T09:00:00Z`,
        endUtc: `${new Date().toISOString().split("T")[0]}T11:30:00Z`,
        status: "Assigned",
        note: "Requires battery diagnostic equipment",
        createdAt: `${new Date().toISOString()}`,
    },
    {
        id: "assign-3",
        centerId: "center-2",
        technicianId: "tech-4",
        serviceRequestId: "request-1",
        startUtc: `${new Date().toISOString().split("T")[0]}T10:00:00Z`,
        status: "Assigned",
        createdAt: `${new Date().toISOString()}`,
    },
];

// ============================================================================
// QUEUE TICKETS (Hàng chờ)
// ============================================================================

export const mockQueueTickets: QueueTicket[] = [
    {
        id: "queue-1",
        centerId: "center-1",
        serviceRequestId: "request-101",
        queueNo: 1,
        priority: 1,
        status: "Waiting",
        estimatedStartUtc: `${new Date().toISOString().split("T")[0]}T13:00:00Z`,
        createdAt: `${new Date(Date.now() - 3600000).toISOString()}`, // 1 hour ago
    },
    {
        id: "queue-2",
        centerId: "center-1",
        serviceRequestId: "request-102",
        queueNo: 2,
        priority: 2,
        status: "Waiting",
        estimatedStartUtc: `${new Date().toISOString().split("T")[0]}T14:00:00Z`,
        createdAt: `${new Date(Date.now() - 1800000).toISOString()}`, // 30 min ago
    },
    {
        id: "queue-3",
        centerId: "center-1",
        serviceRequestId: "request-103",
        queueNo: 3,
        priority: 3,
        status: "Ready",
        estimatedStartUtc: `${new Date().toISOString().split("T")[0]}T13:30:00Z`,
        createdAt: `${new Date(Date.now() - 7200000).toISOString()}`, // 2 hours ago
    },
    {
        id: "queue-4",
        centerId: "center-1",
        serviceRequestId: "request-104",
        queueNo: 4,
        priority: 1,
        status: "Waiting",
        createdAt: `${new Date(Date.now() - 900000).toISOString()}`, // 15 min ago
    },
    {
        id: "queue-5",
        centerId: "center-2",
        serviceRequestId: "request-201",
        queueNo: 1,
        priority: 2,
        status: "Waiting",
        estimatedStartUtc: `${new Date().toISOString().split("T")[0]}T15:00:00Z`,
        createdAt: `${new Date(Date.now() - 5400000).toISOString()}`, // 1.5 hours ago
    },
];

// ============================================================================
// QUEUE DETAILS (Chi tiết hàng chờ - để hiển thị thông tin customer)
// ============================================================================

export interface QueueTicketDetail extends QueueTicket {
    customerName: string;
    vehicleInfo: string;
    services: string;
    phone?: string;
}

export const mockQueueTicketDetails: QueueTicketDetail[] = [
    {
        ...mockQueueTickets[0],
        customerName: "Võ Văn Nam",
        vehicleInfo: "VinFast VF5 Plus",
        services: "Kiểm tra hệ thống điện",
        phone: "0978901234",
    },
    {
        ...mockQueueTickets[1],
        customerName: "Bùi Thị Thanh",
        vehicleInfo: "Tesla Model Y",
        services: "Bảo dưỡng định kỳ",
        phone: "0989012345",
    },
    {
        ...mockQueueTickets[2],
        customerName: "Đinh Văn Phúc",
        vehicleInfo: "Hyundai Ioniq 5",
        services: "Thay pin 12V, Kiểm tra phanh",
        phone: "0990123456",
    },
    {
        ...mockQueueTickets[3],
        customerName: "Mai Thị Hoa",
        vehicleInfo: "VinFast VF8",
        services: "Sửa chữa cửa sổ điện",
        phone: "0901234567",
    },
    {
        ...mockQueueTickets[4],
        customerName: "Ngô Văn Tài",
        vehicleInfo: "BMW iX3",
        services: "Cập nhật phần mềm, Kiểm tra tổng quát",
        phone: "0912345678",
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get centers (simulating API call)
 */
export const getMockCenters = async (): Promise<Center[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay
    return mockCenters;
};

/**
 * Get technicians by center
 */
export const getMockTechnicians = async (
    centerId?: string
): Promise<Technician[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (centerId) {
        return mockTechnicians.filter((tech) => tech.centerId === centerId);
    }
    return mockTechnicians;
};

/**
 * Get capacity for a center
 */
export const getMockCapacity = async (
    centerId: string,
    _date: string
): Promise<SlotCapacity> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return (
        mockSlotCapacity[centerId] || {
            date: _date,
            centerId,
            capacity: 20,
            occupied: 0,
            available: 20,
        }
    );
};

/**
 * Get assignable work items
 */
export const getMockAssignableWork = async (
    centerId: string,
    _date: string
): Promise<AssignableWorkItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    // In real app, filter by centerId and date
    return mockAssignableWork;
};

/**
 * Get queue tickets
 */
export const getMockQueueTickets = async (
    centerId: string,
    _date: string
): Promise<QueueTicketDetail[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockQueueTicketDetails.filter(
        (ticket) => ticket.centerId === centerId
    );
};

/**
 * Get assignments
 */
export const getMockAssignments = async (
    centerId: string,
    _date: string
): Promise<Assignment[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockAssignments.filter((assign) => assign.centerId === centerId);
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
    centers: mockCenters,
    technicians: mockTechnicians,
    slotCapacity: mockSlotCapacity,
    assignableWork: mockAssignableWork,
    assignments: mockAssignments,
    queueTickets: mockQueueTickets,
    queueTicketDetails: mockQueueTicketDetails,
    // Helper functions
    getMockCenters,
    getMockTechnicians,
    getMockCapacity,
    getMockAssignableWork,
    getMockQueueTickets,
    getMockAssignments,
};
