/**
 * Data Transfer Objects for API communication
 */

import type { ChannelType, PreferredTimeWindow } from './domain';

export interface QuickCustomerDTO {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface QuickVehicleDTO {
  customerId: string;
  brand?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
  notes?: string;
}

export interface CreateServiceRequestDTO {
  customerId: string;
  vehicleId?: string;
  serviceTypeIds: string[];
  preferredCenterId?: string;
  preferredTimeWindow?: PreferredTimeWindow;
  notes?: string;
  channel: ChannelType;
  allowContact: boolean;
  attachments?: string[];
}

export interface UpdateServiceRequestDTO {
  serviceTypeIds?: string[];
  preferredCenterId?: string;
  preferredTimeWindow?: PreferredTimeWindow;
  notes?: string;
  channel?: ChannelType;
  allowContact?: boolean;
  status?: string;
}

export interface SearchCustomersParams {
  q: string;
  limit?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  path?: string[];
  details?: Record<string, unknown>;
}

export interface ApiFieldError {
  path: string[];
  message: string;
}

export interface ApiValidationError {
  message: string;
  errors: ApiFieldError[];
}
