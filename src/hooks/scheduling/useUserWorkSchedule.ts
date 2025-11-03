import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserWorkSchedule,
  CreateUserWorkScheduleDto,
  UpdateUserWorkScheduleDto,
  BulkAssignTechniciansDto,
  AutoAssignRequestDto,
  BulkAssignResult,
} from "@/entities/userworkschedule.types";
import { userWorkScheduleService } from "@/services/userWorkScheduleService";
import { toast } from "sonner";

/**
 * Custom hooks for UserWorkSchedule operations
 */

/**
 * Hook to fetch user work schedules for a specific user within a date range
 */
export function useUserWorkSchedules(
  userId: string,
  startDate: string,
  endDate: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["userWorkSchedules", userId, startDate, endDate],
    queryFn: () =>
      userWorkScheduleService.getUserWorkSchedulesByRange(
        userId,
        startDate,
        endDate
      ),
    enabled: enabled && !!userId,
  });
}

/**
 * Hook to fetch a single user work schedule by ID
 */
export function useUserWorkSchedule(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["userWorkSchedule", id],
    queryFn: () => userWorkScheduleService.getUserWorkSchedule(id),
    enabled: enabled && !!id,
  });
}

/**
 * Hook to fetch all user work schedules for a user
 */
export function useUserWorkSchedulesByUser(
  userId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["userWorkSchedulesByUser", userId],
    queryFn: () => userWorkScheduleService.getUserWorkSchedulesByUser(userId),
    enabled: enabled && !!userId,
  });
}

/**
 * Hook to fetch user work schedules for a work schedule
 */
export function useUserWorkSchedulesByWorkSchedule(
  workScheduleId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["userWorkSchedulesByWorkSchedule", workScheduleId],
    queryFn: () =>
      userWorkScheduleService.getUserWorkSchedulesByWorkSchedule(
        workScheduleId
      ),
    enabled: enabled && !!workScheduleId,
  });
}

/**
 * Hook to check availability
 */
export function useAvailabilityCheck(
  userId?: string,
  workScheduleId?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["availability", userId, workScheduleId],
    queryFn: () =>
      userWorkScheduleService.checkAvailability(userId, workScheduleId),
    enabled: enabled && (!!userId || !!workScheduleId),
  });
}

/**
 * Hook to get user workload
 */
export function useUserWorkload(
  userId: string,
  date?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["userWorkload", userId, date],
    queryFn: () => userWorkScheduleService.getWorkload(userId, date),
    enabled: enabled && !!userId,
  });
}

/**
 * Hook to get scheduling conflicts
 */
export function useSchedulingConflicts(
  userId: string,
  startTime?: string,
  endTime?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["schedulingConflicts", userId, startTime, endTime],
    queryFn: () =>
      userWorkScheduleService.getConflicts(userId, startTime, endTime),
    enabled: enabled && !!userId,
  });
}

/**
 * Hook to create a user work schedule assignment
 */
export function useCreateUserWorkSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserWorkScheduleDto) =>
      userWorkScheduleService.createUserWorkSchedule(data),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: ["userWorkSchedules"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userWorkSchedulesByUser", data.userId],
      });
      
      toast.success("Work schedule assigned successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to assign work schedule";
      toast.error(message);
    },
  });
}

/**
 * Hook to update a user work schedule
 */
export function useUpdateUserWorkSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserWorkScheduleDto;
    }) => userWorkScheduleService.updateUserWorkSchedule(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["userWorkSchedules"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userWorkSchedule", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["userWorkSchedulesByUser", data.userId],
      });
      
      toast.success("Work schedule updated successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to update work schedule";
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a user work schedule
 */
export function useDeleteUserWorkSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      userWorkScheduleService.deleteUserWorkSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userWorkSchedules"],
      });
      
      toast.success("Work schedule removed successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to remove work schedule";
      toast.error(message);
    },
  });
}

/**
 * Hook to bulk assign technicians
 */
export function useBulkAssignTechnicians() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkAssignTechniciansDto) =>
      userWorkScheduleService.bulkAssignTechnicians(data),
    onSuccess: (result: BulkAssignResult) => {
      queryClient.invalidateQueries({
        queryKey: ["userWorkSchedules"],
      });
      
      if (result.successCount > 0) {
        toast.success(
          `Successfully assigned ${result.successCount} technician(s)`
        );
      }
      
      if (result.failureCount > 0) {
        toast.warning(
          `${result.failureCount} assignment(s) failed`
        );
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to bulk assign technicians";
      toast.error(message);
    },
  });
}

/**
 * Hook to auto-assign technicians
 */
export function useAutoAssignTechnicians() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AutoAssignRequestDto) =>
      userWorkScheduleService.autoAssignTechnicians(data),
    onSuccess: (result: BulkAssignResult) => {
      queryClient.invalidateQueries({
        queryKey: ["userWorkSchedules"],
      });
      
      if (result.successCount > 0) {
        toast.success(
          `Auto-assigned ${result.successCount} technician(s)`
        );
      }
      
      if (result.failureCount > 0) {
        toast.warning(
          `Could not auto-assign ${result.failureCount} technician(s)`
        );
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to auto-assign technicians";
      toast.error(message);
    },
  });
}
