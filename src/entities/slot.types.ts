export interface SlotCapacity {
    date: string;        // YYYY-MM-DD
    centerId: string;
    capacity: number;
    occupied: number;
    available: number;
}

export interface Center {
    id: string;
    name: string;
    address?: string;
    capacity?: number;
}

export interface Technician {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    centerId?: string;
    specialties?: string[];
    isActive: boolean;
    shift?: "Morning" | "Afternoon" | "Evening";
    workload?: "Light" | "Balanced" | "Heavy";
}
