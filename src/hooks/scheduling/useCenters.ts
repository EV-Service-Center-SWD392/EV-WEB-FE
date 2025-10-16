import { useQuery, UseQueryResult } from "@tanstack/react-query";

import type { Center } from "@/entities/slot.types";
import { staffDirectoryService } from "@/services/staffDirectoryService";

/**
 * Hook to fetch all centers
 */
export function useCenters(): UseQueryResult<Center[], Error> {
    return useQuery({
        queryKey: ["centers"],
        queryFn: () => staffDirectoryService.getCenters(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to fetch a single center by ID
 */
export function useCenter(centerId: string | null): UseQueryResult<Center, Error> {
    return useQuery({
        queryKey: ["centers", centerId],
        queryFn: () => staffDirectoryService.getCenterById(centerId!),
        enabled: !!centerId,
        staleTime: 5 * 60 * 1000,
    });
}
