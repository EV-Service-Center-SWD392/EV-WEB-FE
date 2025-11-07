import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { technicianService } from "@/services/technicianService";
import { Technician } from "@/entities/technician.types";
import { roleService } from "@/services/roleService";
import { Role } from "@/entities/role.types";
import { toast } from "sonner";

/**
 * Custom hooks for Technician operations
 */

/**
 * Hook to fetch all roles
 */
export function useRoles(enabled: boolean = true) {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getRoles(),
    enabled,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 0, // Only call API once
  });
}

/**
 * Hook to find technician role ID
 */
export function useTechnicianRoleId() {
  return useQuery({
    queryKey: ["technicianRoleId"],
    queryFn: async () => {
      const roles = await roleService.getRoles();
      const technicianRole = roles.find(role => 
        role?.name?.toUpperCase() === "TECHNICIAN"
      );
      return technicianRole?.id || null;
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    retry: 0, // Only call API once
  });
}

/**
 * Hook to fetch all technicians
 */
export function useTechnicians(enabled: boolean = true) {
  const { data: technicianRoleId, isLoading: isLoadingRoleId } = useTechnicianRoleId();

  return useQuery({
    queryKey: ["technicians", technicianRoleId],
    queryFn: () => {
      // getTechnicians doesn't require roleId - it returns all technicians with certificates
      return technicianService.getTechnicians();
    },
    enabled: enabled,
    retry: 0, // Only call API once
  });
}

/**
 * Hook to fetch a single technician by ID
 */
export function useTechnician(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["technician", id],
    queryFn: () => technicianService.getTechnicianById(id),
    enabled: enabled && !!id,
    retry: 0, // Only call API once
  });
}

/**
 * Hook to search technicians
 */
export function useSearchTechnicians(searchTerm: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["technicians", "search", searchTerm],
    queryFn: () => {
      // Use getTechnicians and filter client-side since searchTechnicians doesn't exist
      return technicianService.getTechnicians().then(technicians =>
        technicians.filter(tech =>
          tech.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tech.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    },
    enabled: enabled && searchTerm.length >= 2,
    retry: 0, // Only call API once
  });
}

/**
 * Hook to get available technicians for a specific date and shift
 */
export function useAvailableTechnicians(
  date: string,
  shift: string,
  assignedTechnicianIds: string[] = [],
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [
      "technicians",
      "available",
      date,
      shift,
      assignedTechnicianIds,
    ],
    queryFn: () => {
      // Since getAvailableTechnicians doesn't exist, get all and filter client-side
      return technicianService.getTechnicians().then(technicians =>
        technicians.filter(tech => 
          !assignedTechnicianIds.includes(tech.userId)
        )
      );
    },
    enabled: enabled && !!date && !!shift,
    retry: 0, // Only call API once
  });
}

/**
 * Hook to get all users (for admin purposes)
 */
export function useAllUsers(enabled: boolean = true) {
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: () => technicianService.getAllUsers(),
    enabled,
    retry: 0, // Only call API once
  });
}

/**
 * Helper hook to get technician display name
 */
export function useTechnicianDisplayName(technician?: Technician): string {
  if (!technician) return "";
  // Return userName or email as display name
  return technician.userName || technician.email || "";
}
