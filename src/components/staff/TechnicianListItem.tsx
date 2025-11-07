"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Technician } from "@/entities/slot.types";
import { GripVertical } from "lucide-react";

interface TechnicianListItemProps {
  technician: Technician;
}

export default function TechnicianListItem({ technician }: TechnicianListItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: technician.id,
    data: { technician },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? "grabbing" : "grab",
      }
    : { cursor: "grab" };

  const initials = (technician.name || "T")
    .split(" ")
    .map(n => n[0] || "")
    .join("")
    .toUpperCase() || "T";
  const fullName = technician.name || technician.email || "Unknown";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <Avatar className="h-9 w-9 flex-shrink-0 bg-blue-100 text-blue-700">
          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
          <p className="text-xs text-gray-500 truncate">
            {technician.email}
          </p>
        </div>
      </div>
    </div>
  );
}
