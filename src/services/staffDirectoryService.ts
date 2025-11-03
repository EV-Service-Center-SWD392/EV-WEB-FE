import type { Center, SlotCapacity, Technician } from "@/entities/slot.types";
// TEMPORARY: Mock data for development
import {
    getMockCenters,
    getMockTechnicians,
    getMockCapacity
} from "@/lib/mockData/schedulingMockData";

import { api } from "./api";

const CENTERS_PATH = "/api/centers";
const USERS_PATH = "/api/users";
const ROLES_PATH = "/api/roles";
const CAPACITY_PATH = "/api/capacity";
const USE_MOCK_DATA = false; // Set to false when connecting to real API

/**
 * Staff Directory Service
 * Manages centers, technicians, and capacity information
 */
export const staffDirectoryService = {
    /**
     * Get all centers
     */
    async getCenters(): Promise<Center[]> {
        // TEMPORARY: Use mock data during development
        if (USE_MOCK_DATA) {
            return getMockCenters();
        }

        const response = await api.get<Center[]>(CENTERS_PATH);
        return response.data;
    },

    /**
     * Get a single center by ID
     */
    async getCenterById(id: string): Promise<Center> {
        const response = await api.get<Center>(`${CENTERS_PATH}/${id}`);
        return response.data;
    },

    /**
     * Get technicians by center
     */
    async getTechnicians(centerId?: string): Promise<Technician[]> {
        // TEMPORARY: Use mock data during development
        if (USE_MOCK_DATA) {
            return getMockTechnicians(centerId);
        }

        try {
            // First get the TECHNICIAN role ID
            const rolesResponse = await api.get(ROLES_PATH);
            const technicianRole = rolesResponse.data.data?.find(
                (role: { name: string; isActive: boolean; roleId: string }) => role.name === "TECHNICIAN" && role.isActive
            );
            
            if (!technicianRole) {
                console.warn("TECHNICIAN role not found");
                return [];
            }

            // Then get users with TECHNICIAN role
            const usersResponse = await api.get(USERS_PATH, {
                params: {
                    roleId: technicianRole.roleId,
                    ...(centerId && { centerId })
                }
            });

            const users = usersResponse.data.data || [];
            
            // Transform users to Technician format
            return users.map((user: {
                userId?: string;
                id?: string;
                fullName?: string;
                name?: string;
                email: string;
                phoneNumber?: string;
                phone?: string;
                centerId?: string;
                specialties?: string[];
                isActive?: boolean;
            }): Technician => ({
                id: user.userId || user.id || '',
                name: user.fullName || user.name || '',
                email: user.email,
                phone: user.phoneNumber || user.phone || '',
                centerId: user.centerId,
                specialties: user.specialties || [],
                isActive: user.isActive ?? true
            }));
        } catch (error) {
            console.error("Error fetching technicians:", error);
            return [];
        }
    },

    /**
     * Get a single technician by ID
     */
    async getTechnicianById(id: string): Promise<Technician> {
        if (USE_MOCK_DATA) {
            const allTechs = await getMockTechnicians();
            const tech = allTechs.find(t => t.id === id);
            if (!tech) throw new Error("Technician not found");
            return tech;
        }

        try {
            const response = await api.get(`${USERS_PATH}/${id}`);
            const user = response.data.data;
            
            return {
                id: user.userId || user.id,
                name: user.fullName || user.name,
                email: user.email,
                phone: user.phoneNumber || user.phone,
                centerId: user.centerId,
                specialties: user.specialties || [],
                isActive: user.isActive ?? true
            };
        } catch (error) {
            console.error("Error fetching technician:", error);
            throw new Error("Technician not found");
        }
    },

    /**
     * Get capacity for a center on a specific date
     */
    async getCapacity(centerId: string, date: string): Promise<SlotCapacity> {
        // TEMPORARY: Use mock data during development
        if (USE_MOCK_DATA) {
            return getMockCapacity(centerId, date);
        }

        const response = await api.get<SlotCapacity>(CAPACITY_PATH, {
            params: { centerId, date },
        });
        return response.data;
    },

    /**
     * Get capacity for multiple dates (range)
     */
    async getCapacityRange(
        centerId: string,
        startDate: string,
        endDate: string
    ): Promise<SlotCapacity[]> {
        const response = await api.get<SlotCapacity[]>(`${CAPACITY_PATH}/range`, {
            params: { centerId, startDate, endDate },
        });
        return response.data;
    },
};

export default staffDirectoryService;
