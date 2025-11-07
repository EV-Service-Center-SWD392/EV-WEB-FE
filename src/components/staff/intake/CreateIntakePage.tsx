/**
 * CreateIntakePage - LEGACY COMPONENT - NEEDS REFACTORING
 * TODO: Update to use new Service Intake API
 * See: SERVICE_INTAKE_INTEGRATION.md for API documentation
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function CreateIntakePage() {
  const router = useRouter();

  return (
    <div className="container max-w-4xl py-8">
      <div className="rounded-lg border bg-yellow-50 p-4 mb-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          ⚠️ Page Under Maintenance
        </h2>
        <p className="text-yellow-700 mb-4">
          This page is being refactored to use the new Service Intake API.
          Please use the ApprovedBookingsList page to create service intakes.
        </p>
        <button
          onClick={() => router.push('/staff/intake')}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Go to Service Intake List
        </button>
      </div>
    </div>
  );
}
