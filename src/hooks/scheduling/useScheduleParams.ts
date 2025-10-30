import { useMemo } from "react";

import { useSchedulingStore } from "@/stores/scheduling.store";

/**
 * Hook to manage schedule parameters (center + date)
 * Provides derived values and helpers
 */
export function useScheduleParams() {
    const { centerId, selectedDate, setCenterId, setSelectedDate } =
        useSchedulingStore();

    // Derived values
    const scheduleKey = useMemo(() => {
        if (!centerId || !selectedDate) return null;
        return `${centerId}-${selectedDate}`;
    }, [centerId, selectedDate]);

    const isToday = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        return selectedDate === today;
    }, [selectedDate]);

    const formattedDate = useMemo(() => {
        if (!selectedDate) return "";
        const date = new Date(selectedDate);
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }, [selectedDate]);

    // Helper functions
    const goToToday = () => {
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
    };

    const goToPreviousDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        setSelectedDate(date.toISOString().split("T")[0]);
    };

    const goToNextDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        setSelectedDate(date.toISOString().split("T")[0]);
    };

    return {
        centerId,
        selectedDate,
        scheduleKey,
        isToday,
        formattedDate,
        setCenterId,
        setSelectedDate,
        goToToday,
        goToPreviousDay,
        goToNextDay,
    };
}
