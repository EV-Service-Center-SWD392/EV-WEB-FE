import { useQuery, UseQueryResult } from "@tanstack/react-query";

import type { Technician } from "@/entities/slot.types";
import { staffDirectoryService } from "@/services/staffDirectoryService";

/**
 * Hook to fetch technicians for a specific center
 */
export function useTechnicians(
    centerId: string | null
): UseQueryResult<Technician[], Error> {
    return useQuery({
        queryKey: ["technicians", centerId],
        queryFn: () => staffDirectoryService.getTechnicians(centerId ?? undefined),
        enabled: !!centerId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        select: (data) => data.filter((tech) => tech.isActive), // Only active techs
    });
}

/**
 * Hook to fetch all technicians (no center filter)
 */
export function useAllTechnicians(): UseQueryResult<Technician[], Error> {
    return useQuery({
        queryKey: ["technicians"],
        queryFn: () => staffDirectoryService.getTechnicians(),
        staleTime: 5 * 60 * 1000,
        select: (data) => data.filter((tech) => tech.isActive),
    });
}

/**
 * Hook to fetch a single technician by ID
 */
export function useTechnician(
    technicianId: string | null
): UseQueryResult<Technician, Error> {
    return useQuery({
        queryKey: ["technicians", technicianId],
        queryFn: () => staffDirectoryService.getTechnicianById(technicianId!),
        enabled: !!technicianId,
        staleTime: 5 * 60 * 1000,
    });
}
