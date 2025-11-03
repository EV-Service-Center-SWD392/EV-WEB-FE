// Role entity types based on Swagger API specification

export interface Role {
  id: string; // UUID
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleListResponse {
  data: Role[];
  total?: number;
}
