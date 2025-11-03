import { useQuery, UseQueryResult } from "@tanstack/react-query";

import type { Technician } from "@/entities/slot.types";
import { technicianService, type TechnicianUser } from "@/services/technicianService";

// TECHNICIAN role ID from your API response
const TECHNICIAN_ROLE_ID = "59c7a145-dec1-425d-82a8-12abafb14789";

// Transform TechnicianUser to Technician interface
function transformToTechnician(user: TechnicianUser): Technician {
    return {
        id: user.userId,
        name: technicianService.getTechnicianDisplayName(user),
        email: user.email,
        phone: user.phoneNumber,
        centerId: undefined,
        specialties: [],
        isActive: user.isActive
    };
}

/**
 * Hook to fetch all technicians
 */
export function useTechnicians(): UseQueryResult<Technician[], Error> {
    return useQuery({
        queryKey: ["technicians"],
        queryFn: async () => {
            const users = await technicianService.getTechnicians(TECHNICIAN_ROLE_ID);
            return users.map(transformToTechnician);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        select: (data) => data.filter((tech) => tech.isActive), // Only active techs
        retry: 0, // Only call API once
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
        queryFn: async () => {
            const user = await technicianService.getUserById(technicianId!);
            return transformToTechnician(user);
        },
        enabled: !!technicianId,
        staleTime: 5 * 60 * 1000,
        retry: 0, // Only call API once
    });
}
