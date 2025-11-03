"use client";

import React from "react";
import TechnicianScheduleAssignment from "@/components/staff/TechnicianScheduleAssignment";

/**
 * Staff Schedule Management Page
 * Allows staff to assign technicians to work schedules
 */
export default function StaffSchedulePage() {
  return (
    <div className="h-screen flex flex-col">
      <TechnicianScheduleAssignment />
    </div>
  );
}
