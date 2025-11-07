"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShiftType } from "@/entities/userworkschedule.types";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    userId: string;
    shift: ShiftType;
    centerId: string;
    userWorkScheduleId: string;
    technicianName: string;
  };
}

interface ScheduleEventComponentProps {
  event: CalendarEvent;
}

export default function ScheduleEventComponent({ event }: ScheduleEventComponentProps) {
  const getShiftColor = (shift: ShiftType) => {
    switch (shift) {
      case "Morning":
        return "bg-blue-500 text-white";
      case "Evening":
        return "bg-orange-500 text-white";
      case "Night":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="p-1 h-full">
      <div className={`rounded px-2 py-1 text-xs font-medium ${getShiftColor(event.resource.shift)}`}>
        <div className="truncate">{event.resource.technicianName}</div>
        <div className="text-[10px] opacity-90">{event.resource.shift}</div>
      </div>
    </div>
  );
}
