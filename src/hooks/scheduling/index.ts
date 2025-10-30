/**
 * Scheduling Feature - Hooks Index
 * Export all scheduling hooks for easier imports
 */

export { useCenters, useCenter } from "./useCenters";
export { useTechnicians, useAllTechnicians, useTechnician } from "./useTechnicians";
export {
    useTodayBookings,
    useAssignableBookings,
} from "./useTodayBookings";
export {
    useAssignableWork,
    useAssignableBookingsAsWork,
    transformBookingToWorkItem,
    type AssignableWorkItem,
} from "./useAssignableWork";
export {
    useAssignments,
    useCreateAssignment,
    useUpdateAssignment,
    useDeleteAssignment,
    useCheckConflict,
} from "./useAssignments";
export {
    useQueue,
    useAddToQueue,
    useReorderQueue,
    useMarkNoShow,
    useUpdateQueueEta,
    useUpdateQueueTicket,
    useDeleteQueueTicket,
    useConvertQueueToAssignment,
} from "./useQueue";
export { useScheduleParams } from "./useScheduleParams";
