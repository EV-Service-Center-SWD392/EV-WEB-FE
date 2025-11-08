"use client";

import React from "react";
import TechnicianScheduleAssignment from "@/components/staff/TechnicianScheduleAssignment";

/**
 * Staff Technician Schedule Management Page
 * Allows staff to manage technician schedules and assignments
 */
export default function StaffTechnicianSchedulePage() {
  return (
    <div className="h-screen flex flex-col">
      <TechnicianScheduleAssignment />
    </div>
  );
}
