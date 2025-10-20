/**
 * Atomic Center Select Component
 * Dropdown to select a service center
 */

"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Center } from "@/entities/slot.types";
import { cn } from "@/lib/utils";

export interface ACenterSelectProps {
    id?: string;
    label?: string;
    value: string | null;
    onChange: (_centerId: string) => void;
    centers: Center[];
    disabled?: boolean;
    error?: string;
    placeholder?: string;
    className?: string;
}

export const ACenterSelect: React.FC<ACenterSelectProps> = ({
    id = "center-select",
    label = "Select Center",
    value,
    onChange,
    centers,
    disabled = false,
    error,
    placeholder = "Choose a center...",
    className,
}) => {
    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <Label htmlFor={id} className={cn(error && "text-destructive")}>
                    {label}
                </Label>
            )}
            <Select
                value={value || undefined}
                onValueChange={onChange}
                disabled={disabled}
            >
                <SelectTrigger id={id} className={cn(error && "border-destructive")}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {centers.length === 0 ? (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                            No centers available
                        </div>
                    ) : (
                        centers.map((center) => (
                            <SelectItem key={center.id} value={center.id}>
                                {center.name}
                                {center.address && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        ({center.address})
                                    </span>
                                )}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
            {error && (
                <p className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

ACenterSelect.displayName = "ACenterSelect";
