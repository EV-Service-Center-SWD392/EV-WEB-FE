"use client";

import React from "react";
import TechnicianScheduleAssignment from "@/components/staff/TechnicianScheduleAssignment";

/**
 * Admin Schedule Management Page
 * Allows admins to assign technicians to work schedules
 */
export default function AdminSchedulePage() {
  return (
    <div className="h-screen flex flex-col">
      <TechnicianScheduleAssignment />
    </div>
  );
}
