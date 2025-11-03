/**
 * Atomic Technician Select Component
 * Dropdown to select a technician
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
import type { Technician } from "@/entities/slot.types";
import { cn } from "@/lib/utils";

export interface ATechSelectProps {
    id?: string;
    label?: string;
    value: string | null;
    onChange: (_technicianId: string) => void;
    technicians: Technician[];
    disabled?: boolean;
    error?: string;
    placeholder?: string;
    className?: string;
    showDetails?: boolean;
}

export const ATechSelect: React.FC<ATechSelectProps> = ({
    id = "tech-select",
    label = "Select Technician",
    value,
    onChange,
    technicians,
    disabled = false,
    error,
    placeholder = "Choose a technician...",
    className,
    showDetails = false,
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
                    {technicians.length === 0 ? (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                            No technicians available
                        </div>
                    ) : (
                        technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                                <div className="flex flex-col">
                                    <span>{tech.name}</span>
                                    {showDetails && (
                                        <span className="text-xs text-muted-foreground">
                                            {[tech.shift && `Ca ${tech.shift}`, tech.workload && `Tải ${tech.workload?.toLowerCase()}`, tech.specialties?.length ? tech.specialties.join(", ") : null]
                                                .filter(Boolean)
                                                .join(" • ")}
                                        </span>
                                    )}
                                </div>
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

ATechSelect.displayName = "ATechSelect";
