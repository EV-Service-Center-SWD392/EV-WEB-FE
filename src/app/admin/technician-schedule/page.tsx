"use client";

import React from "react";
import TechnicianScheduleAssignment from "@/components/staff/TechnicianScheduleAssignment";

/**
 * Admin Parts Schedule Management Page
 * Allows admins to manage technician parts schedules
 */
export default function AdminPartsSchedulePage() {
  return (
    <div className="h-screen flex flex-col">
      <TechnicianScheduleAssignment />
    </div>
  );
}
