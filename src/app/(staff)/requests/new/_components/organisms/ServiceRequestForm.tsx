/**
 * Service Request Form Organism
 * Main form for creating a service request - presentational only, no API calls
 */

'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { createServiceRequestSchema, type CreateServiceRequestInput } from '@/features/service-request/schemas/createServiceRequest.schema';
import type { Customer, Vehicle, ServiceType, Center, PreferredTimeWindow } from '@/features/service-request/types/domain';

import { CustomerSearch } from '../molecules/CustomerSearch';
import { VehiclePicker } from '../molecules/VehiclePicker';
import { ServiceMultiSelect } from '../molecules/ServiceMultiSelect';
import { CenterPreference } from '../molecules/CenterPreference';
import { PreferredTimeWindow as PreferredTimeWindowComponent } from '../molecules/PreferredTimeWindow';
import { ASelect } from '../atoms/ASelect';
import { ATextarea } from '../atoms/ATextarea';
import { AFormMessage } from '../atoms/AFormMessage';

export interface ServiceRequestFormProps {
  // Data
  customers: Customer[];
  vehicles: Vehicle[];
  serviceTypes: ServiceType[];
  centers: Center[];

  // Loading states
  isLoadingCustomers: boolean;
  isLoadingVehicles: boolean;
  isLoadingServiceTypes: boolean;
  isLoadingCenters: boolean;
  isSubmitting: boolean;

  // Errors
  customerSearchError?: string | null;
  submitError?: string | null;
  fieldErrors?: Record<string, string>;

  // Event handlers
  onCustomerSearch: (_query: string) => void;
  onSelectCustomer: (_customer: Customer) => void;
  onSelectVehicle: (_vehicle: Vehicle | null) => void;
  onToggleServiceType: (_serviceType: ServiceType) => void;
  onSelectCenter: (_center: Center | null) => void;
  onSubmit: (_data: CreateServiceRequestInput) => Promise<void>;

  // UI handlers
  onCreateCustomer?: () => void;
  onCreateVehicle?: () => void;

  // Current selections
  selectedCustomer?: Customer | null;
  selectedVehicle?: Vehicle | null;
  selectedServiceTypes?: ServiceType[];
  selectedCenter?: Center | null;
}

export const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  customers,
  vehicles,
  serviceTypes,
  centers,
  isLoadingCustomers,
  isLoadingVehicles,
  isLoadingServiceTypes,
  isLoadingCenters,
  isSubmitting,
  customerSearchError,
  submitError,
  fieldErrors,
  onCustomerSearch,
  onSelectCustomer,
  onSelectVehicle,
  onToggleServiceType,
  onSelectCenter,
  onSubmit,
  onCreateCustomer,
  onCreateVehicle,
  selectedCustomer,
  selectedVehicle,
  selectedServiceTypes = [],
  selectedCenter,
}) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateServiceRequestInput>({
    resolver: zodResolver(createServiceRequestSchema),
    defaultValues: {
      channel: 'WalkIn',
      allowContact: false,
      serviceTypeIds: [],
    },
  });

  // Sync external selections with form
  React.useEffect(() => {
    if (selectedCustomer) {
      setValue('customerId', selectedCustomer.id);
    }
  }, [selectedCustomer, setValue]);

  React.useEffect(() => {
    if (selectedVehicle) {
      setValue('vehicleId', selectedVehicle.id);
    } else {
      setValue('vehicleId', undefined);
    }
  }, [selectedVehicle, setValue]);

  React.useEffect(() => {
    setValue(
      'serviceTypeIds',
      selectedServiceTypes.map((st) => st.id)
    );
  }, [selectedServiceTypes, setValue]);

  React.useEffect(() => {
    if (selectedCenter) {
      setValue('preferredCenterId', selectedCenter.id);
    } else {
      setValue('preferredCenterId', undefined);
    }
  }, [selectedCenter, setValue]);

  const allowContact = watch('allowContact');

  const handleFormSubmit = async (data: CreateServiceRequestInput) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Global Error */}
      {submitError && <AFormMessage type="error" message={submitError} />}

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Customer, Vehicle, Services */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Search or create a customer</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerSearch
                customers={customers}
                isLoading={isLoadingCustomers}
                error={customerSearchError || fieldErrors?.customerId}
                selectedCustomer={selectedCustomer}
                onSearch={onCustomerSearch}
                onSelectCustomer={onSelectCustomer}
                onCreateNew={onCreateCustomer}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle</CardTitle>
              <CardDescription>Select a vehicle or skip</CardDescription>
            </CardHeader>
            <CardContent>
              <VehiclePicker
                vehicles={vehicles}
                isLoading={isLoadingVehicles}
                selectedVehicle={selectedVehicle}
                onSelectVehicle={onSelectVehicle}
                onCreateNew={onCreateVehicle}
                disabled={!selectedCustomer}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Types</CardTitle>
              <CardDescription>Select at least one service</CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceMultiSelect
                serviceTypes={serviceTypes}
                selectedServiceTypes={selectedServiceTypes}
                onToggleServiceType={onToggleServiceType}
                isLoading={isLoadingServiceTypes}
                error={fieldErrors?.serviceTypeIds}
                required
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preferences, Notes, Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Center</CardTitle>
              <CardDescription>Customer&apos;s preferred location</CardDescription>
            </CardHeader>
            <CardContent>
              <CenterPreference
                centers={centers}
                selectedCenter={selectedCenter}
                onSelectCenter={onSelectCenter}
                isLoading={isLoadingCenters}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Preferences</CardTitle>
              <CardDescription>When would the customer prefer service?</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="preferredTimeWindow"
                control={control}
                render={({ field }) => (
                  <PreferredTimeWindowComponent
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldErrors?.preferredTimeWindow}
                  />
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ASelect
                label="Channel"
                options={[
                  { value: 'WalkIn', label: 'Walk-In' },
                  { value: 'Phone', label: 'Phone' },
                  { value: 'Web', label: 'Web' },
                  { value: 'Email', label: 'Email' },
                ]}
                required
                error={fieldErrors?.channel}
                {...register('channel')}
              />

              <ATextarea
                label="Notes"
                placeholder="Any special requests or additional information..."
                rows={4}
                maxLength={500}
                showCount
                error={fieldErrors?.notes || errors.notes?.message}
                {...register('notes')}
              />

              <div className="flex items-start gap-3 p-3 rounded-md border">
                <input
                  type="checkbox"
                  id="allowContact"
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                  {...register('allowContact')}
                />
                <div className="flex-1">
                  <label htmlFor="allowContact" className="text-sm font-medium cursor-pointer">
                    Allow Contact
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customer agrees to be contacted about this service request
                  </p>
                  {fieldErrors?.allowContact && (
                    <p className="text-xs text-destructive mt-1">
                      {fieldErrors.allowContact}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Sticky Submit Bar */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 -mx-4 lg:-mx-6">
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between sm:items-center">
          <p className="text-sm text-muted-foreground">
            {!allowContact && (
              <span className="text-destructive">⚠️ Customer must allow contact to proceed</span>
            )}
            {allowContact && selectedServiceTypes.length === 0 && (
              <span className="text-destructive">⚠️ Select at least one service type</span>
            )}
            {allowContact && selectedServiceTypes.length > 0 && !selectedCustomer && (
              <span className="text-destructive">⚠️ Select a customer</span>
            )}
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !allowContact || !selectedCustomer || selectedServiceTypes.length === 0}
            className="sm:min-w-[200px]"
          >
            {isSubmitting ? 'Creating Request...' : 'Create Service Request'}
          </Button>
        </div>
      </div>
    </form>
  );
};

ServiceRequestForm.displayName = 'ServiceRequestForm';
