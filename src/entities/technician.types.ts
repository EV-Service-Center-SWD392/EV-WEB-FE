// Technician and Certificate Types based on API documentation

export interface Technician {
  userId: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  status?: string;
  isActive: boolean;
  role?: string;
  certificates?: TechnicianCertificate[];
  validCertificateCount?: number;
  expiredCertificateCount?: number;
}

export interface Certificate {
  certificateId: string;
  name: string;
  description?: string;
  status?: string;
  isActive: boolean;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TechnicianCertificate {
  userCertificateId: string;
  userId: string;
  certificateId: string;
  certificateName: string;
  status: 'Pending' | 'Approved' | 'Revoked';
  assignedDate: string;
  expiryDate?: string;
  isActive: boolean;
  isExpired?: boolean;
  daysUntilExpiry?: number;
}

export interface CreateTechnicianDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  roleId: string;
}

export interface UpdateTechnicianDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  status?: string;
  isActive: boolean;
}

export interface CreateCertificateDto {
  name: string;
  description?: string;
  status?: string;
}

export interface UpdateCertificateDto {
  name?: string;
  description?: string;
  status?: string;
  isActive: boolean;
}

export interface AssignCertificateDto {
  userId: string;
  certificateId: string;
}

export interface TechnicianFilters {
  search?: string;
  status?: string;
  isActive?: boolean;
  certificateStatus?: string;
}

export interface CertificateFilters {
  search?: string;
  status?: string;
  isActive?: boolean;
  expiringDays?: number;
}