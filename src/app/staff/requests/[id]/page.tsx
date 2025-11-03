/**
 * Service Request Detail Page
 * View a specific service request (read-only for now)
 */

import * as React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// This would normally fetch from API
async function getServiceRequest(id: string) {
  // TODO: Replace with actual API call
  // const request = await requestsService.getServiceRequest(id);

  // Mock data for now
  if (!id) return null;

  return {
    id,
    status: 'New' as const,
    customer: {
      id: '1',
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
    },
    vehicle: {
      id: '1',
      brand: 'Toyota',
      model: 'Camry',
      year: 2022,
      licensePlate: 'ABC-1234',
    },
    serviceTypes: [
      { id: '1', name: 'Oil Change', isActive: true },
      { id: '2', name: 'Tire Rotation', isActive: true },
    ],
    preferredCenter: {
      id: '1',
      name: 'Downtown Service Center',
      address: '123 Main St',
      isActive: true,
    },
    channel: 'WalkIn' as const,
    notes: 'Customer prefers morning appointments',
    allowContact: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Service Request #${id} | EV Service Center`,
    description: 'View service request details',
  };
}

export default async function ServiceRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const request = await getServiceRequest(id);

  if (!request) {
    notFound();
  }

  const statusColors = {
    New: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Validated: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    Contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Request #{request.id}</h1>
              <Badge className={statusColors[request.status]}>{request.status}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Created {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Back
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{request.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{request.customer.phone}</p>
              </div>
              {request.customer.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{request.customer.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Info */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {request.vehicle ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle</p>
                    <p className="font-medium">
                      {request.vehicle.brand} {request.vehicle.model} ({request.vehicle.year})
                    </p>
                  </div>
                  {request.vehicle.licensePlate && (
                    <div>
                      <p className="text-sm text-muted-foreground">License Plate</p>
                      <p className="font-medium">{request.vehicle.licensePlate}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No vehicle specified</p>
              )}
            </CardContent>
          </Card>

          {/* Service Types */}
          <Card>
            <CardHeader>
              <CardTitle>Requested Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {request.serviceTypes.map((service) => (
                  <Badge key={service.id} variant="outline">
                    {service.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {request.preferredCenter && (
                <div>
                  <p className="text-sm text-muted-foreground">Preferred Center</p>
                  <p className="font-medium">{request.preferredCenter.name}</p>
                  <p className="text-sm text-muted-foreground">{request.preferredCenter.address}</p>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Channel</p>
                <p className="font-medium">{request.channel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Allowed</p>
                <p className="font-medium">{request.allowContact ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {request.notes && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{request.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
