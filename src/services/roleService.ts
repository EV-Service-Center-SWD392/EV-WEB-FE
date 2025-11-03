import { api } from "./api";
import { Role, RoleListResponse } from "@/entities/role.types";

/**
 * Role Service
 * API endpoint: /api/UserRole
 */

export const roleService = {
  /**
   * Get all user roles
   */
  async getRoles(): Promise<Role[]> {
    const response = await api.get<Role[]>("/api/UserRole");
    return response.data;
  },

  /**
   * Get a specific role by ID
   */
  async getRole(id: string): Promise<Role> {
    const response = await api.get<Role>(`/api/UserRole/${id}`);
    return response.data;
  },

  /**
   * Find role by name
   */
  async getRoleByName(name: string): Promise<Role | null> {
    const roles = await this.getRoles();
    return roles.find(role => 
      role?.name?.toUpperCase() === name.toUpperCase()
    ) || null;
  },
};
