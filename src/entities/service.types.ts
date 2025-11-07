export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  durationMinutes?: number;
  category?: string;
  isActive?: boolean;
}

export interface ServiceCatalogOption {
  id: string;
  name: string;
  group?: string;
  description?: string;
  durationMinutes?: number;
}
