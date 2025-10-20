/**
 * Checklist Table Component
 * Lists checklist items grouped by category
 */

'use client';

import * as React from 'react';

import type {
    ChecklistResponse,
    ChecklistByCategory,
} from '@/entities/intake.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { ChecklistItemRow } from './ChecklistItemRow';

interface ChecklistTableProps {
    checklistGroups: ChecklistByCategory[];
    responses: ChecklistResponse[];
    onResponseChangeAction: (_response: Partial<ChecklistResponse>) => void;
    readOnly?: boolean;
}

export function ChecklistTable({
    checklistGroups,
    responses,
    onResponseChangeAction,
    readOnly = false,
}: ChecklistTableProps) {
    // Create a map of responses by checklist item ID
    const responseMap = React.useMemo(() => {
        const map: Record<string, ChecklistResponse> = {};
        responses.forEach((response) => {
            map[response.checklistItemId] = response;
        });
        return map;
    }, [responses]);

    if (checklistGroups.length === 0) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                        <p>No checklist items available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {checklistGroups.map((group) => (
                <Card key={group.category}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{group.category}</CardTitle>
                            <Badge variant="outline">
                                {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                            </Badge>
                        </div>
                        <CardDescription>
                            Complete all required items in this category
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {group.items.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <ChecklistItemRow
                                    item={item}
                                    response={responseMap[item.id]}
                                    onChangeAction={onResponseChangeAction}
                                    readOnly={readOnly}
                                />
                                {index < group.items.length - 1 && <Separator />}
                            </React.Fragment>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
