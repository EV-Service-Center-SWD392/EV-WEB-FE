/**
 * Auto-save hook with debouncing
 * Automatically saves draft data after a period of inactivity
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface UseAutoSaveOptions<T> {
    data: T;
    onSave: (_data: T) => Promise<void> | void;
    delay?: number; // milliseconds
    enabled?: boolean;
}

/**
 * Hook to automatically save data after a delay
 * Default delay is 30 seconds
 */
export function useAutoSave<T>({
    data,
    onSave,
    delay = 30000, // 30 seconds
    enabled = true,
}: UseAutoSaveOptions<T>) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const previousDataRef = useRef<T>(data);
    const isSavingRef = useRef(false);

    const save = useCallback(async () => {
        if (isSavingRef.current) return;

        try {
            isSavingRef.current = true;
            await onSave(data);
            previousDataRef.current = data;
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            isSavingRef.current = false;
        }
    }, [data, onSave]);

    useEffect(() => {
        if (!enabled) return;

        // Check if data has changed
        const hasChanged =
            JSON.stringify(data) !== JSON.stringify(previousDataRef.current);

        if (!hasChanged) return;

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            save();
        }, delay);

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, delay, enabled, save]);

    // Save on unmount if there are unsaved changes
    useEffect(() => {
        return () => {
            const hasUnsavedChanges =
                JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
            if (hasUnsavedChanges && enabled && !isSavingRef.current) {
                onSave(data);
            }
        };
    }, [data, enabled, onSave]);

    return {
        isSaving: isSavingRef.current,
        forceSave: save,
    };
}

/**
 * Debounce hook for manual save triggers
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
