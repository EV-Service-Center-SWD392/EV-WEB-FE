/**
 * Certificate and User Certificate Types
 * Based on EV_SCMMS API Swagger Documentation
 */

// ============ Certificate Types ============

/**
 * Certificate entity from API
 */
export interface Certificate {
  certificateId: string;
  name: string;
  description?: string;
  status: string; // "ACTIVE" | "INACTIVE"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new certificate
 */
export interface CreateCertificateDto {
  name: string;
  description?: string;
  status?: string;
}

/**
 * DTO for updating a certificate
 */
export interface UpdateCertificateDto {
  name?: string;
  description?: string;
  status?: string;
  isActive?: boolean;
}

// ============ User Certificate Types ============

/**
 * User Certificate assignment entity
 */
export interface UserCertificate {
  userCertificateId: string;
  userId: string;
  userName?: string;
  certificateId: string;
  certificateName: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Revoked';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  certificateImage?: string | null; // Image URL for the certificate
}

/**
 * Complete User Certificate with all information (from GET /api/UserCertificate)
 * Includes full details about the certificate assignment including expiry information
 */
export interface UserCertificateDetail {
  userCertificateId: string;
  userId: string;
  userName: string;
  certificateId: string;
  certificateName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'Pending' | 'Approved' | 'Rejected' | 'Revoked' | 'Active';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  certificateImage: string | null;
  expiryDate: string;
  isExpired: boolean;
  daysUntilExpiry: number;
}

/**
 * DTO for assigning a certificate to a user/technician
 */
export interface AssignCertificateDto {
  userId: string;
  certificateId: string;
  status?: string;
}

/**
 * DTO for technician to request/submit a new certificate
 * Corresponds to backend model with Name, Description, ImageFile
 */
export interface RequestCertificateDto {
  name: string;
  description?: string;
  imageFile?: File;
}

/**
 * Pending certificate assignment (for staff/admin review)
 */
export interface PendingCertificate {
  userCertificateId: string;
  userId: string;
  userName: string;
  certificateId: string;
  certificateName: string;
  status: 'Pending';
  createdAt: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

/**
 * Expiring certificate information
 */
export interface ExpiringCertificate {
  userCertificateId: string;
  userId: string;
  userName: string;
  certificateId: string;
  certificateName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: string;
}

// ============ Technician with Certificates ============

/**
 * Technician with their certificate information
 * From GET /api/UserAccount/technicians endpoint
 */
export interface TechnicianWithCertificates {
  userId: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  certificates: UserCertificate[];
  validCertificatesCount: number;
  expiredCertificatesCount: number;
}

/**
 * Certificate holders (users who have a specific certificate)
 */
export interface CertificateHolder {
  userCertificateId: string;
  userId: string;
  userName: string;
  email: string;
  status: string;
  isActive: boolean;
  expiryDate?: string;
  daysUntilExpiry?: number;
}

// ============ API Response Types ============

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message?: string;
}

/**
 * Certificate validation result
 */
export interface CertificateValidation {
  isValid: boolean;
  userId: string;
  certificateId: string;
  status?: string;
  expiryDate?: string;
}

/**
 * Certificate expiry status
 */
export interface CertificateExpiryStatus {
  certificateId: string;
  certificateName: string;
  totalHolders: number;
  activeHolders: number;
  expiringCount: number;
  expiredCount: number;
}

// ============ Filter Types ============

/**
 * Filters for certificate queries
 */
export interface CertificateFilters {
  search?: string;
  status?: string;
  isActive?: boolean;
}

/**
 * Filters for user certificate queries
 */
export interface UserCertificateFilters {
  userId?: string;
  certificateId?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Revoked';
  isActive?: boolean;
  daysAhead?: number; // For expiring certificates
}
