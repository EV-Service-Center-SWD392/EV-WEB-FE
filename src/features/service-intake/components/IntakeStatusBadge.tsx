/**
 * IntakeStatusBadge Component
 * Displays intake status with color-coded badge
 */

import { Badge } from "@/components/ui/badge";
import { INTAKE_STATUS_WORKFLOW, type IntakeStatus } from "../types";

interface IntakeStatusBadgeProps {
    status: IntakeStatus;
    showDescription?: boolean;
}

export function IntakeStatusBadge({ status, showDescription = false }: IntakeStatusBadgeProps) {
    const workflow = INTAKE_STATUS_WORKFLOW[status];

    if (!workflow) {
        return <Badge variant="outline">Unknown</Badge>;
    }

    return (
        <div className="flex flex-col gap-1">
            <Badge
                variant="outline"
                className={`${workflow.color} ${workflow.bgColor} border-0`}
            >
                {workflow.label}
            </Badge>
            {showDescription && (
                <p className="text-xs text-muted-foreground">{workflow.description}</p>
            )}
        </div>
    );
}
