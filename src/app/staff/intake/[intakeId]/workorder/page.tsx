"use client";

import { useParams } from "next/navigation";

import { IntakeWorkOrderView } from "@/components/workorders/IntakeWorkOrderView";

export default function StaffIntakeWorkOrderPage() {
  const params = useParams();
  const intakeIdParam = Array.isArray(params?.intakeId) ? params.intakeId[0] : params?.intakeId;
  const intakeId = intakeIdParam ?? "";

  return <IntakeWorkOrderView intakeId={intakeId} mode="staff" />;
}
