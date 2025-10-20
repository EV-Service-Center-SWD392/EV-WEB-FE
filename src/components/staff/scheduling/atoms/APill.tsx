/**
 * Atomic Pill/Badge Component
 * Display status or priority tags
 */

"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PillVariant =
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info";

export interface APillProps {
    children: React.ReactNode;
    variant?: PillVariant;
    className?: string;
    onClick?: () => void;
}

const variantStyles: Record<PillVariant, string> = {
    default: "",
    secondary: "",
    destructive: "",
    outline: "",
    success: "bg-green-100 text-green-800 hover:bg-green-100/80",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
    info: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
};

export const APill: React.FC<APillProps> = ({
    children,
    variant = "default",
    className,
    onClick,
}) => {
    // Map custom variants to Badge variants
    const badgeVariant =
        variant === "success" || variant === "warning" || variant === "info"
            ? "secondary"
            : variant;

    return (
        <Badge
            variant={badgeVariant}
            className={cn(variantStyles[variant], className, onClick && "cursor-pointer")}
            onClick={onClick}
        >
            {children}
        </Badge>
    );
};

APill.displayName = "APill";
