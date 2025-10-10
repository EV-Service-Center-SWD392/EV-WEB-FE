export enum UserRole {
  ADMIN = "admin",
  STAFF = "staff",
  TECHNICIAN = "technician",
  MEMBER = "member",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  isActive?: boolean;
}

export interface UserFilters {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: "asc" | "desc";
}
