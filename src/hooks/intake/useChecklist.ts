/**
 * Custom hooks for Checklist management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
    ChecklistItem,
    ChecklistResponse,
    SaveChecklistResponsesRequest,
    ChecklistByCategory,
    ChecklistResponseMap,
} from '@/entities/intake.types';
import {
    getChecklistItems,
    getChecklistResponses,
    saveChecklistResponses,
} from '@/services/intakeService';

/**
 * Hook to fetch all active checklist items
 */
export function useChecklistItems() {
    return useQuery({
        queryKey: ['checklist-items'],
        queryFn: getChecklistItems,
        staleTime: 1000 * 60 * 5, // 5 minutes - items don't change often
    });
}

/**
 * Hook to fetch checklist responses for an intake
 */
export function useChecklistResponses(intakeId: string) {
    return useQuery({
        queryKey: ['checklist-responses', intakeId],
        queryFn: () => getChecklistResponses(intakeId),
        enabled: !!intakeId,
    });
}

/**
 * Combined hook to fetch checklist items with responses
 */
export function useChecklist(intakeId: string) {
    const itemsQuery = useChecklistItems();
    const responsesQuery = useChecklistResponses(intakeId);

    return {
        items: itemsQuery.data ?? [],
        responses: responsesQuery.data ?? [],
        isLoading: itemsQuery.isLoading || responsesQuery.isLoading,
        isError: itemsQuery.isError || responsesQuery.isError,
        error: itemsQuery.error || responsesQuery.error,
    };
}

/**
 * Hook to save checklist responses
 */
export function useSaveChecklistResponses(intakeId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SaveChecklistResponsesRequest) =>
            saveChecklistResponses(intakeId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['checklist-responses', intakeId],
            });
            toast.success('Checklist responses saved');
        },
        onError: (error: Error) => {
            toast.error(`Failed to save responses: ${error.message}`);
        },
    });
}

/**
 * Helper hook to group checklist items by category
 */
export function useChecklistByCategory(
    items: ChecklistItem[]
): ChecklistByCategory[] {
    const categories: ChecklistByCategory[] = [];
    const categoryMap = new Map<string, ChecklistItem[]>();

    // Group items by category
    items.forEach((item) => {
        if (!categoryMap.has(item.category)) {
            categoryMap.set(item.category, []);
        }
        categoryMap.get(item.category)!.push(item);
    });

    // Convert to array and sort items within each category
    categoryMap.forEach((categoryItems, category) => {
        categories.push({
            category: category as ChecklistByCategory['category'],
            items: categoryItems.sort((a, b) => a.order - b.order),
        });
    });

    // Sort categories by name
    return categories.sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Helper hook to create a map of responses by checklist item ID
 */
export function useChecklistResponseMap(
    responses: ChecklistResponse[]
): ChecklistResponseMap {
    const map: ChecklistResponseMap = {};
    responses.forEach((response) => {
        map[response.checklistItemId] = response;
    });
    return map;
}

/**
 * Hook to check if all required checklist items have responses
 */
export function useChecklistCompletion(
    items: ChecklistItem[],
    responses: ChecklistResponse[]
) {
    const responseMap = useChecklistResponseMap(responses);
    const requiredItems = items.filter((item) => item.isRequired);
    const completedRequired = requiredItems.filter(
        (item) => !!responseMap[item.id]
    );

    return {
        total: items.length,
        completed: responses.length,
        requiredTotal: requiredItems.length,
        requiredCompleted: completedRequired.length,
        isAllRequiredCompleted: completedRequired.length === requiredItems.length,
        completionPercentage:
            items.length > 0 ? Math.round((responses.length / items.length) * 100) : 0,
    };
}
