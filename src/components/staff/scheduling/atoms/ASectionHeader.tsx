/**
 * Atomic Section Header Component
 * Consistent section headers with optional actions
 */

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface ASectionHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const ASectionHeader: React.FC<ASectionHeaderProps> = ({
    title,
    description,
    action,
    className,
}) => {
    return (
        <div className={cn("flex items-center justify-between", className)}>
            <div>
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};

ASectionHeader.displayName = "ASectionHeader";
