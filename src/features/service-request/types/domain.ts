/**
 * Domain types for Service Request Intake feature
 * These represent the core business entities
 */

export type ServiceRequestStatus = 'New' | 'Validated' | 'Contacted' | 'Converted' | 'Rejected';

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Any';

export type ChannelType = 'Phone' | 'WalkIn' | 'Web' | 'Email';

export interface PreferredTimeWindow {
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  timeOfDay?: TimeOfDay;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  brand?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  estimatedDuration?: number; // minutes
  basePrice?: number;
  isActive: boolean;
}

export interface Center {
  id: string;
  name: string;
  address: string;
  phone?: string;
  isActive: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  customer?: Customer;
  vehicleId?: string;
  vehicle?: Vehicle;
  serviceTypeIds: string[];
  serviceTypes?: ServiceType[];
  preferredCenterId?: string;
  preferredCenter?: Center;
  preferredTimeWindow?: PreferredTimeWindow;
  notes?: string;
  channel: ChannelType;
  allowContact: boolean;
  status: ServiceRequestStatus;
  attachments?: string[]; // URLs
  flagged?: boolean;
  flagReason?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlacklistCheckResult {
  flagged: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingRequestId?: string;
  existingRequest?: ServiceRequest;
}
