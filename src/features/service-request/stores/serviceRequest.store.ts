/**
 * Local state store for Service Request feature
 * Uses Zustand for lightweight, scoped state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Customer, Vehicle, ServiceType, Center } from '../types/domain';

interface ServiceRequestState {
  // Form state
  selectedCustomer: Customer | null;
  selectedVehicle: Vehicle | null;
  selectedServiceTypes: ServiceType[];
  selectedCenter: Center | null;

  // UI state
  isQuickCustomerModalOpen: boolean;
  isQuickVehicleModalOpen: boolean;
  isDuplicateWarningVisible: boolean;
  duplicateRequestId: string | null;

  // Loading states
  isLoadingServiceTypes: boolean;
  isLoadingCenters: boolean;

  // Available options
  serviceTypes: ServiceType[];
  centers: Center[];

  // Actions
  setSelectedCustomer: (_customer: Customer | null) => void;
  setSelectedVehicle: (_vehicle: Vehicle | null) => void;
  setSelectedServiceTypes: (_serviceTypes: ServiceType[]) => void;
  toggleServiceType: (_serviceType: ServiceType) => void;
  setSelectedCenter: (_center: Center | null) => void;

  setQuickCustomerModalOpen: (_open: boolean) => void;
  setQuickVehicleModalOpen: (_open: boolean) => void;
  setDuplicateWarning: (_requestId: string | null) => void;

  setServiceTypes: (_serviceTypes: ServiceType[]) => void;
  setCenters: (_centers: Center[]) => void;
  setLoadingServiceTypes: (_loading: boolean) => void;
  setLoadingCenters: (_loading: boolean) => void;  // Reset
  reset: () => void;
}

const initialState = {
  selectedCustomer: null,
  selectedVehicle: null,
  selectedServiceTypes: [],
  selectedCenter: null,
  isQuickCustomerModalOpen: false,
  isQuickVehicleModalOpen: false,
  isDuplicateWarningVisible: false,
  duplicateRequestId: null,
  isLoadingServiceTypes: false,
  isLoadingCenters: false,
  serviceTypes: [],
  centers: [],
};

export const useServiceRequestStore = create<ServiceRequestState>()(
  devtools(
    (set) => ({
      ...initialState,

      setSelectedCustomer: (customer) =>
        set({ selectedCustomer: customer }, false, 'setSelectedCustomer'),

      setSelectedVehicle: (vehicle) =>
        set({ selectedVehicle: vehicle }, false, 'setSelectedVehicle'),

      setSelectedServiceTypes: (serviceTypes) =>
        set({ selectedServiceTypes: serviceTypes }, false, 'setSelectedServiceTypes'),

      toggleServiceType: (serviceType) =>
        set(
          (state) => {
            const exists = state.selectedServiceTypes.find((st) => st.id === serviceType.id);
            if (exists) {
              return {
                selectedServiceTypes: state.selectedServiceTypes.filter(
                  (st) => st.id !== serviceType.id
                ),
              };
            } else {
              return {
                selectedServiceTypes: [...state.selectedServiceTypes, serviceType],
              };
            }
          },
          false,
          'toggleServiceType'
        ),

      setSelectedCenter: (center) =>
        set({ selectedCenter: center }, false, 'setSelectedCenter'),

      setQuickCustomerModalOpen: (open) =>
        set({ isQuickCustomerModalOpen: open }, false, 'setQuickCustomerModalOpen'),

      setQuickVehicleModalOpen: (open) =>
        set({ isQuickVehicleModalOpen: open }, false, 'setQuickVehicleModalOpen'),

      setDuplicateWarning: (requestId) =>
        set(
          {
            isDuplicateWarningVisible: !!requestId,
            duplicateRequestId: requestId,
          },
          false,
          'setDuplicateWarning'
        ),

      setServiceTypes: (serviceTypes) =>
        set({ serviceTypes }, false, 'setServiceTypes'),

      setCenters: (centers) => set({ centers }, false, 'setCenters'),

      setLoadingServiceTypes: (loading) =>
        set({ isLoadingServiceTypes: loading }, false, 'setLoadingServiceTypes'),

      setLoadingCenters: (loading) =>
        set({ isLoadingCenters: loading }, false, 'setLoadingCenters'),

      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'ServiceRequestStore' }
  )
);
