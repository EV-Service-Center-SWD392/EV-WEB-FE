"use client";

import { useParams } from "next/navigation";

import { IntakeWorkOrderView } from "@/components/workorders/IntakeWorkOrderView";

export default function TechnicianIntakeWorkOrderPage() {
  const params = useParams();
  const intakeIdParam = Array.isArray(params?.intakeId) ? params.intakeId[0] : params?.intakeId;
  const intakeId = intakeIdParam ?? "";

  return <IntakeWorkOrderView intakeId={intakeId} mode="technician" />;
}
