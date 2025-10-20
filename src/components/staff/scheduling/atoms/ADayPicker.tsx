/**
 * Atomic Day Picker Component
 * Simple date input for selecting a date
 */

"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ADayPickerProps {
    id?: string;
    label?: string;
    value: string; // YYYY-MM-DD
    onChange: (_date: string) => void;
    min?: string;
    max?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
}

export const ADayPicker: React.FC<ADayPickerProps> = ({
    id = "day-picker",
    label = "Select Date",
    value,
    onChange,
    min,
    max,
    disabled = false,
    error,
    className,
}) => {
    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <Label htmlFor={id} className={cn(error && "text-destructive")}>
                    {label}
                </Label>
            )}
            <Input
                id={id}
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                max={max}
                disabled={disabled}
                className={cn(error && "border-destructive")}
                aria-invalid={!!error}
            />
            {error && (
                <p className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

ADayPicker.displayName = "ADayPicker";
