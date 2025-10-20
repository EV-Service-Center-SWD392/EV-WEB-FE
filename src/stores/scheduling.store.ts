import { create } from "zustand";

export type ListDensity = "comfortable" | "compact";
export type SortOption = "priority" | "time" | "queueNo";

interface SchedulingState {
    // Selected filters
    centerId: string | null;
    selectedDate: string; // YYYY-MM-DD

    // UI preferences
    listDensity: ListDensity;
    sortOption: SortOption;

    // Drag & drop state
    isDragging: boolean;
    draggedItemId: string | null;

    // Actions
    setCenterId: (_centerId: string | null) => void;
    setSelectedDate: (_date: string) => void;
    setListDensity: (_density: ListDensity) => void;
    setSortOption: (_option: SortOption) => void;
    setDragging: (_isDragging: boolean, _itemId?: string | null) => void;
    reset: () => void;
}

/**
 * Scheduling Store
 * Manages UI state for scheduling and queue features
 * Scoped to the scheduling feature only
 */
export const useSchedulingStore = create<SchedulingState>((set) => ({
    // Initial state
    centerId: null,
    selectedDate: new Date().toISOString().split("T")[0], // Today by default
    listDensity: "comfortable",
    sortOption: "priority",
    isDragging: false,
    draggedItemId: null,

    // Actions
    setCenterId: (centerId) => set({ centerId }),

    setSelectedDate: (date) => set({ selectedDate: date }),

    setListDensity: (density) => {
        set({ listDensity: density });
        // Persist to localStorage if needed
        if (typeof window !== "undefined") {
            localStorage.setItem("scheduling_list_density", density);
        }
    },

    setSortOption: (option) => {
        set({ sortOption: option });
        if (typeof window !== "undefined") {
            localStorage.setItem("scheduling_sort_option", option);
        }
    },

    setDragging: (isDragging, itemId = null) =>
        set({ isDragging, draggedItemId: itemId }),

    reset: () =>
        set({
            centerId: null,
            selectedDate: new Date().toISOString().split("T")[0],
            listDensity: "comfortable",
            sortOption: "priority",
            isDragging: false,
            draggedItemId: null,
        }),
}));

// Selectors (optional, for performance optimization)
export const selectScheduleKey = (state: SchedulingState) => ({
    centerId: state.centerId,
    date: state.selectedDate,
});

export const selectUIPrefs = (state: SchedulingState) => ({
    listDensity: state.listDensity,
    sortOption: state.sortOption,
});
