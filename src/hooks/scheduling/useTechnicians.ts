import { useQuery, UseQueryResult } from "@tanstack/react-query";

import type { Technician } from "@/entities/slot.types";
import { technicianService } from "@/services/technicianService";
import type { Technician as TechnicianEntity } from "@/entities/technician.types";

// Transform TechnicianEntity to Technician interface for slots
function transformToTechnician(user: TechnicianEntity): Technician {
    return {
        id: user.userId,
        name: user.userName || user.email || "",
        email: user.email,
        phone: user.phoneNumber || "",
        centerId: undefined,
        specialties: [],
        isActive: true
    };
}

/**
 * Hook to fetch all technicians
 */
export function useTechnicians(): UseQueryResult<Technician[], Error> {
    return useQuery({
        queryKey: ["technicians"],
        queryFn: async () => {
            const users = await technicianService.getTechnicians();
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
            const user = await technicianService.getTechnicianById(technicianId!);
            return transformToTechnician(user);
        },
        enabled: !!technicianId,
        staleTime: 5 * 60 * 1000,
        retry: 0, // Only call API once
    });
}
