/**
 * Service Request Container
 * Container component that handles all business logic and state management
 * Connects hooks, services, and the presentational form
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { QuickCustomerInput } from '@/features/service-request/schemas/quickCustomer.schema';
import type { QuickVehicleInput } from '@/features/service-request/schemas/quickVehicle.schema';
import type { CreateServiceRequestInput } from '@/features/service-request/schemas/createServiceRequest.schema';
import type { ServiceType, Center, Customer, Vehicle } from '@/features/service-request/types/domain';

import { useServiceRequestStore } from '@/features/service-request/stores/serviceRequest.store';
import { useCustomerSearch } from '@/features/service-request/hooks/useCustomerSearch';
import { useQuickCreateCustomer } from '@/features/service-request/hooks/useQuickCreateCustomer';
import { useQuickCreateVehicle } from '@/features/service-request/hooks/useQuickCreateVehicle';
import { useBlacklistCheck } from '@/features/service-request/hooks/useBlacklistCheck';
import { useCreateServiceRequest } from '@/features/service-request/hooks/useCreateServiceRequest';
import { customersService } from '@/features/service-request/services/customers';

import { ServiceRequestForm } from '../_components/organisms/ServiceRequestForm';
import { QuickCustomerModal } from '../_components/organisms/QuickCustomerModal';
import { QuickVehicleModal } from '../_components/organisms/QuickVehicleModal';
import { DuplicateWarningBanner } from '../_components/organisms/DuplicateWarningBanner';

// Mock data loaders - replace with actual API calls
const loadServiceTypes = async (): Promise<ServiceType[]> => {
  // TODO: Replace with actual API call
  return [
    { id: '1', name: 'Oil Change', description: 'Basic oil change service', estimatedDuration: 30, isActive: true },
    { id: '2', name: 'Tire Rotation', description: 'Rotate all four tires', estimatedDuration: 45, isActive: true },
    { id: '3', name: 'Brake Inspection', description: 'Comprehensive brake system check', estimatedDuration: 60, isActive: true },
    { id: '4', name: 'Battery Check', description: 'Test battery and charging system', estimatedDuration: 20, isActive: true },
  ];
};

const loadCenters = async (): Promise<Center[]> => {
  // TODO: Replace with actual API call
  return [
    { id: '1', name: 'Downtown Service Center', address: '123 Main St, City', phone: '+1234567890', isActive: true },
    { id: '2', name: 'Westside Location', address: '456 West Ave, City', phone: '+1234567891', isActive: true },
  ];
};

export const ServiceRequestContainer: React.FC = () => {
  const router = useRouter();
  
  // Zustand store
  const {
    selectedCustomer,
    selectedVehicle,
    selectedServiceTypes,
    selectedCenter,
    isQuickCustomerModalOpen,
    isQuickVehicleModalOpen,
    isDuplicateWarningVisible,
    duplicateRequestId,
    serviceTypes,
    centers,
    isLoadingServiceTypes,
    isLoadingCenters,
    setSelectedCustomer,
    setSelectedVehicle,
    toggleServiceType,
    setSelectedCenter,
    setQuickCustomerModalOpen,
    setQuickVehicleModalOpen,
    setDuplicateWarning,
    setServiceTypes,
    setCenters,
    setLoadingServiceTypes,
    setLoadingCenters,
    reset: resetStore,
  } = useServiceRequestStore();

  // Custom hooks
  const {
    customers,
    isLoading: isLoadingCustomers,
    error: customerSearchError,
    search: searchCustomers,
  } = useCustomerSearch();

  const {
    createCustomer,
    isCreating: isCreatingCustomer,
    error: createCustomerError,
  } = useQuickCreateCustomer();

  const {
    createVehicle,
    isCreating: isCreatingVehicle,
    error: createVehicleError,
  } = useQuickCreateVehicle();

  const {
    check: checkBlacklist,
    result: blacklistResult,
  } = useBlacklistCheck();

  const {
    createRequest,
    isCreating: isCreatingRequest,
    error: createRequestError,
    fieldErrors,
    duplicateRequestId: apiDuplicateRequestId,
  } = useCreateServiceRequest();

  // Local state for customer's vehicles
  const [customerVehicles, setCustomerVehicles] = React.useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = React.useState(false);

  // Load service types and centers on mount
  React.useEffect(() => {
    const loadOptions = async () => {
      setLoadingServiceTypes(true);
      setLoadingCenters(true);
      
      try {
        const [types, locations] = await Promise.all([
          loadServiceTypes(),
          loadCenters(),
        ]);
        setServiceTypes(types);
        setCenters(locations);
      } catch (error) {
        console.error('Failed to load options:', error);
        toast.error('Failed to load form options');
      } finally {
        setLoadingServiceTypes(false);
        setLoadingCenters(false);
      }
    };

    loadOptions();
  }, [setServiceTypes, setCenters, setLoadingServiceTypes, setLoadingCenters]);

  // Load customer's vehicles when customer is selected
  React.useEffect(() => {
    const loadVehicles = async () => {
      if (!selectedCustomer) {
        setCustomerVehicles([]);
        setSelectedVehicle(null);
        return;
      }

      setIsLoadingVehicles(true);
      try {
        const vehicles = await customersService.getCustomerVehicles(selectedCustomer.id);
        setCustomerVehicles(vehicles);
      } catch (error) {
        console.error('Failed to load vehicles:', error);
        setCustomerVehicles([]);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    loadVehicles();
  }, [selectedCustomer, setSelectedVehicle]);

  // Check blacklist when customer is selected
  React.useEffect(() => {
    if (selectedCustomer) {
      checkBlacklist({
        customerId: selectedCustomer.id,
        phone: selectedCustomer.phone,
        email: selectedCustomer.email,
      });
    }
  }, [selectedCustomer, checkBlacklist]);

  // Show blacklist warning
  React.useEffect(() => {
    if (blacklistResult?.flagged) {
      toast.warning(`⚠️ Customer flagged: ${blacklistResult.reason || 'Risk detected'}`, {
        duration: 5000,
      });
    }
  }, [blacklistResult]);

  // Handle API duplicate detection
  React.useEffect(() => {
    if (apiDuplicateRequestId) {
      setDuplicateWarning(apiDuplicateRequestId);
    }
  }, [apiDuplicateRequestId, setDuplicateWarning]);

  // Handlers
  const handleCustomerSearch = (query: string) => {
    searchCustomers(query);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleSelectVehicle = (vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
  };

  const handleToggleServiceType = (serviceType: ServiceType) => {
    toggleServiceType(serviceType);
  };

  const handleSelectCenter = (center: Center | null) => {
    setSelectedCenter(center);
  };

  const handleCreateCustomer = async (data: QuickCustomerInput) => {
    const customer = await createCustomer(data);
    if (customer) {
      setSelectedCustomer(customer);
      setQuickCustomerModalOpen(false);
      toast.success('Customer created successfully');
    }
  };

  const handleCreateVehicle = async (data: QuickVehicleInput) => {
    const vehicle = await createVehicle(data);
    if (vehicle) {
      setCustomerVehicles((prev) => [...prev, vehicle]);
      setSelectedVehicle(vehicle);
      setQuickVehicleModalOpen(false);
      toast.success('Vehicle added successfully');
    }
  };

  const handleSubmit = async (data: CreateServiceRequestInput) => {
    const request = await createRequest(data);
    
    if (request) {
      toast.success('Service request created successfully!');
      resetStore();
      router.push(`/requests/${request.id}`);
    }
  };

  const handleViewExisting = () => {
    if (duplicateRequestId) {
      router.push(`/requests/${duplicateRequestId}`);
    }
  };

  const handleDismissDuplicate = () => {
    setDuplicateWarning(null);
  };

  return (
    <>
      {/* Duplicate Warning */}
      {isDuplicateWarningVisible && (
        <div className="mb-6">
          <DuplicateWarningBanner
            visible={isDuplicateWarningVisible}
            existingRequestId={duplicateRequestId}
            onViewExisting={handleViewExisting}
            onDismiss={handleDismissDuplicate}
          />
        </div>
      )}

      {/* Main Form */}
      <ServiceRequestForm
        customers={customers}
        vehicles={customerVehicles}
        serviceTypes={serviceTypes}
        centers={centers}
        isLoadingCustomers={isLoadingCustomers}
        isLoadingVehicles={isLoadingVehicles}
        isLoadingServiceTypes={isLoadingServiceTypes}
        isLoadingCenters={isLoadingCenters}
        isSubmitting={isCreatingRequest}
        customerSearchError={customerSearchError}
        submitError={createRequestError}
        fieldErrors={fieldErrors}
        onCustomerSearch={handleCustomerSearch}
        onSelectCustomer={handleSelectCustomer}
        onSelectVehicle={handleSelectVehicle}
        onToggleServiceType={handleToggleServiceType}
        onSelectCenter={handleSelectCenter}
        onSubmit={handleSubmit}
        onCreateCustomer={() => setQuickCustomerModalOpen(true)}
        onCreateVehicle={() => setQuickVehicleModalOpen(true)}
        selectedCustomer={selectedCustomer}
        selectedVehicle={selectedVehicle}
        selectedServiceTypes={selectedServiceTypes}
        selectedCenter={selectedCenter}
      />

      {/* Quick Customer Modal */}
      <QuickCustomerModal
        open={isQuickCustomerModalOpen}
        onOpenChange={setQuickCustomerModalOpen}
        onSubmit={handleCreateCustomer}
        isSubmitting={isCreatingCustomer}
        error={createCustomerError}
      />

      {/* Quick Vehicle Modal */}
      {selectedCustomer && (
        <QuickVehicleModal
          open={isQuickVehicleModalOpen}
          onOpenChange={setQuickVehicleModalOpen}
          onSubmit={handleCreateVehicle}
          customerId={selectedCustomer.id}
          isSubmitting={isCreatingVehicle}
          error={createVehicleError}
        />
      )}
    </>
  );
};

ServiceRequestContainer.displayName = 'ServiceRequestContainer';
