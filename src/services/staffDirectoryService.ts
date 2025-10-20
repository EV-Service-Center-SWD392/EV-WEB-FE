import type { Center, SlotCapacity, Technician } from "@/entities/slot.types";
// TEMPORARY: Mock data for development
import {
    getMockCenters,
    getMockTechnicians,
    getMockCapacity
} from "@/lib/mockData/schedulingMockData";

import { api } from "./api";

const CENTERS_PATH = "/api/centers";
const TECHNICIANS_PATH = "/api/technicians";
const CAPACITY_PATH = "/api/capacity";
const USE_MOCK_DATA = true; // Set to false when connecting to real API

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

        const response = await api.get<Technician[]>(TECHNICIANS_PATH, {
            params: centerId ? { centerId } : undefined,
        });
        return response.data;
    },

    /**
     * Get a single technician by ID
     */
    async getTechnicianById(id: string): Promise<Technician> {
        const response = await api.get<Technician>(`${TECHNICIANS_PATH}/${id}`);
        return response.data;
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
