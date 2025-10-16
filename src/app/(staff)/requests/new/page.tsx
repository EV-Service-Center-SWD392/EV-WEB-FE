/**
 * New Service Request Page
 * Staff-facing page for creating service request intake
 */

import * as React from 'react';
import { Metadata } from 'next';

import { ServiceRequestContainer } from './_container/ServiceRequestContainer';

export const metadata: Metadata = {
  title: 'New Service Request',
  description: 'Record a new service request from a customer via phone or walk-in',
};

export default function NewServiceRequestPage() {
  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">New Service Request</h1>
          <p className="text-muted-foreground mt-2">
            Record a customer&apos;s service request. This will be processed by the booking team.
          </p>
        </div>

        {/* Main Content */}
        <ServiceRequestContainer />
      </div>
    </div>
  );
}
