import { api } from "./api";

/**
 * Technician Service
 * Specialized service for managing technicians (users with Technician role)
 * Uses UserAccount API endpoints with role filtering
 */

export interface TechnicianUser {
  userId: string; // UUID
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  roleId: string; // UUID
  status?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TechnicianFilters {
  name?: string;
  email?: string;
  status?: string;
  isActive?: boolean;
  centerId?: string; // If filtering by service center
}

export const technicianService = {
  /**
   * Get all users from the system
   */
  async getAllUsers(): Promise<TechnicianUser[]> {
    const response = await api.get("/api/UserAccount");
    return response.data;
  },

  /**
   * Get a specific user by ID
   */
  async getUserById(id: string): Promise<TechnicianUser> {
    const response = await api.get<TechnicianUser>(`/api/UserAccount/${id}`);
    return response.data;
  },

  /**
   * Get all technicians by filtering users with Technician roleId
   */
  async getTechnicians(technicianRoleId: string): Promise<TechnicianUser[]> {
    const response = await this.getAllUsers();
    const users = Array.isArray(response) ? response : (response as any)?.data || [];
    
    const technicians = users.filter((user: any) => {
      return user.roleId === technicianRoleId && user.isActive;
    });
    
    return technicians;
  },

  /**
   * Search technicians by name or email
   */
  async searchTechnicians(
    technicianRoleId: string,
    searchTerm: string
  ): Promise<TechnicianUser[]> {
    const technicians = await this.getTechnicians(technicianRoleId);
    const lowerSearch = searchTerm.toLowerCase();
    
    return technicians.filter((tech) => {
      const fullName = `${tech.firstName || ""} ${tech.lastName || ""}`.toLowerCase();
      const email = (tech.email || "").toLowerCase();
      
      return (
        fullName.includes(lowerSearch) ||
        email.includes(lowerSearch)
      );
    });
  },

  /**
   * Get available technicians for a specific date and shift
   */
  async getAvailableTechnicians(
    technicianRoleId: string,
    date: string,
    shift: string,
    assignedTechnicianIds: string[] = []
  ): Promise<TechnicianUser[]> {
    const allTechnicians = await this.getTechnicians(technicianRoleId);
    
    return allTechnicians.filter(
      (tech) => !assignedTechnicianIds.includes(tech.userId)
    );
  },

  /**
   * Format technician full name
   */
  getTechnicianDisplayName(technician: TechnicianUser): string {
    if (technician.firstName || technician.lastName) {
      return `${technician.firstName || ""} ${technician.lastName || ""}`.trim();
    }
    return technician.email;
  },
};
