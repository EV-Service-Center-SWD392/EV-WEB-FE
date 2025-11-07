/**
 * IntakeStatusBadge Component
 * Displays intake status with appropriate styling
 */

import { Badge } from '@/components/ui/badge';
import { getStatusConfig } from '@/lib/intake-status';
import type { IntakeStatus } from '@/entities/intake.types';

interface IntakeStatusBadgeProps {
    status: IntakeStatus;
    showIcon?: boolean;
    className?: string;
}

export function IntakeStatusBadge({
    status,
    showIcon = true,
    className = '',
}: IntakeStatusBadgeProps) {
    const config = getStatusConfig(status);

    return (
        <Badge
            variant="outline"
            className={`${config.bgColor} ${config.color} border ${className}`}
        >
            {showIcon && <span className="mr-1">{config.icon}</span>}
            {config.label}
        </Badge>
    );
}
