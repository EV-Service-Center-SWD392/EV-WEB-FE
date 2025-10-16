'use client';

/**
 * EXAMPLE: How to use mock data with scheduling hooks
 * This file demonstrates how the mock data flows through the system
 */

import { useScheduleParams } from '@/hooks/scheduling/useScheduleParams';
import { useCenters } from '@/hooks/scheduling/useCenters';
import { useTechnicians } from '@/hooks/scheduling/useTechnicians';
import { useAssignments } from '@/hooks/scheduling/useAssignments';
import { useQueue } from '@/hooks/scheduling/useQueue';

export default function ScheduleExample() {
    // 1. Get UI state from Zustand store
    const { centerId, selectedDate, setCenterId, setSelectedDate } = useScheduleParams();

    // 2. Fetch centers (will use mock data from staffDirectoryService)
    const { data: centers, isLoading: centersLoading } = useCenters();

    // 3. Fetch technicians for selected center (mock data)
    const { data: technicians, isLoading: techsLoading } = useTechnicians(centerId);

    // 4. Fetch assignments (mock data)
    const {
        data: assignments,
        isLoading: assignmentsLoading
    } = useAssignments({
        centerId: centerId || undefined,
        date: selectedDate,
    });

    // 5. Fetch queue (mock data)
    const {
        data: queue,
        isLoading: queueLoading
    } = useQueue({
        centerId: centerId || undefined,
        date: selectedDate,
    });

    // Handle center selection
    const handleCenterChange = (newCenterId: string) => {
        setCenterId(newCenterId);
    };

    // Handle date change
    const handleDateChange = (newDate: Date) => {
        setSelectedDate(newDate.toISOString().split('T')[0]);
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Schedule Example với Mock Data</h1>

            {/* Center Selection */}
            <div className="space-y-2">
                <label className="font-semibold">Select Center:</label>
                {centersLoading ? (
                    <p>Loading centers...</p>
                ) : (
                    <select
                        value={centerId || ''}
                        onChange={(e) => handleCenterChange(e.target.value)}
                        className="w-full border rounded p-2"
                    >
                        <option value="">-- Select Center --</option>
                        {centers?.map((center) => (
                            <option key={center.id} value={center.id}>
                                {center.name} (Capacity: {center.capacity})
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
                <label className="font-semibold">Selected Date:</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded p-2"
                />
            </div>

            {/* Technicians List */}
            {centerId && (
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Technicians</h2>
                    {techsLoading ? (
                        <p>Loading technicians...</p>
                    ) : technicians && technicians.length > 0 ? (
                        <div className="grid gap-2">
                            {technicians.map((tech) => (
                                <div key={tech.id} className="border rounded p-3">
                                    <p className="font-semibold">{tech.name}</p>
                                    <p className="text-sm text-gray-600">{tech.email}</p>
                                    <p className="text-sm text-gray-600">
                                        Specialties: {tech.specialties?.join(', ') || 'N/A'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No technicians for this center</p>
                    )}
                </div>
            )}

            {/* Assignments List */}
            {centerId && (
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Assignments</h2>
                    {assignmentsLoading ? (
                        <p>Loading assignments...</p>
                    ) : assignments && assignments.length > 0 ? (
                        <div className="grid gap-2">
                            {assignments.map((assignment) => (
                                <div key={assignment.id} className="border rounded p-3 bg-blue-50">
                                    <p className="font-semibold">Assignment #{assignment.id}</p>
                                    <p className="text-sm">Tech: {assignment.technicianId}</p>
                                    <p className="text-sm">Start: {assignment.startUtc ? new Date(assignment.startUtc).toLocaleString('vi-VN') : 'N/A'}</p>
                                    <p className="text-sm">Status: {assignment.status}</p>
                                    {assignment.note && (
                                        <p className="text-sm text-gray-600">Note: {assignment.note}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No assignments for this date</p>
                    )}
                </div>
            )}

            {/* Queue List */}
            {centerId && (
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Queue</h2>
                    {queueLoading ? (
                        <p>Loading queue...</p>
                    ) : queue && queue.length > 0 ? (
                        <div className="grid gap-2">
                            {queue.map((ticket) => (
                                <div key={ticket.id} className="border rounded p-3 bg-yellow-50">
                                    <p className="font-semibold">Queue #{ticket.queueNo}</p>
                                    <p className="text-sm">Service Request: {ticket.serviceRequestId}</p>
                                    <p className="text-sm">Priority: {ticket.priority}</p>
                                    <p className="text-sm">Status: {ticket.status}</p>
                                    {ticket.estimatedStartUtc && (
                                        <p className="text-sm text-gray-600">
                                            ETA: {new Date(ticket.estimatedStartUtc).toLocaleString('vi-VN')}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No queue tickets for this date</p>
                    )}
                </div>
            )}

            {/* Mock Data Info */}
            <div className="bg-green-100 border border-green-400 rounded p-4 mt-6">
                <h3 className="font-bold text-green-800">ℹ️ Mock Data Active</h3>
                <p className="text-sm text-green-700 mt-2">
                    Tất cả data đang hiển thị là MOCK DATA từ <code>schedulingMockData.ts</code>
                </p>
                <p className="text-sm text-green-700 mt-1">
                    Để tắt mock data, sửa <code>USE_MOCK_DATA = false</code> trong services.
                </p>
                <ul className="text-sm text-green-700 mt-2 list-disc list-inside">
                    <li>assignmentService.ts - line 12</li>
                    <li>queueService.ts - line 14</li>
                    <li>staffDirectoryService.ts - line 14</li>
                </ul>
            </div>
        </div>
    );
}
