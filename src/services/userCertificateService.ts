import { api } from './api';
import type { 
  UserCertificate,
  AssignCertificateDto,
  PendingCertificate,
  ExpiringCertificate,
  CertificateHolder,
  CertificateValidation,
  CertificateExpiryStatus,
  TechnicianWithCertificates,
  ApiResponse
} from '@/entities/certificate.types';

/**
 * User Certificate Service
 * Handles all UserCertificate-related API calls (/api/UserCertificate/*)
 */
class UserCertificateService {
  /**
   * Assign a certificate to a technician
   * POST /api/UserCertificate/assign
   */
  async assignCertificate(data: AssignCertificateDto): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/api/UserCertificate/assign', data);
    return response.data;
  }

  /**
   * Approve a pending certificate assignment
   * POST /api/UserCertificate/{userCertificateId}/approve
   */
  async approveCertificate(userCertificateId: string): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>(`/api/UserCertificate/${userCertificateId}/approve`);
    return response.data;
  }

  /**
   * Reject a pending certificate assignment
   * POST /api/UserCertificate/{userCertificateId}/reject
   */
  async rejectCertificate(userCertificateId: string): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>(`/api/UserCertificate/${userCertificateId}/reject`);
    return response.data;
  }

  /**
   * Get all pending certificate assignments for staff review
   * GET /api/UserCertificate/pending
   */
  async getPendingCertificates(): Promise<ApiResponse<PendingCertificate[]>> {
    const response = await api.get<ApiResponse<PendingCertificate[]>>('/api/UserCertificate/pending');
    return response.data;
  }

  /**
   * Get certificates that are expiring within specified days
   * GET /api/UserCertificate/expiring?daysAhead={days}
   */
  async getExpiringCertificates(daysAhead: number = 30): Promise<ApiResponse<ExpiringCertificate[]>> {
    const response = await api.get<ApiResponse<ExpiringCertificate[]>>('/api/UserCertificate/expiring', { 
      params: { daysAhead } 
    });
    return response.data;
  }

  /**
   * Get all certificates assigned to a specific user
   * GET /api/UserCertificate/user/{userId}
   */
  async getUserCertificates(userId: string): Promise<UserCertificate[]> {
    const response = await api.get<UserCertificate[]>(`/api/UserCertificate/user/${userId}`);
    return response.data;
  }

  /**
   * Get all users who hold a specific certificate
   * GET /api/UserCertificate/certificate/{certificateId}/holders
   */
  async getCertificateHolders(certificateId: string): Promise<CertificateHolder[]> {
    const response = await api.get<CertificateHolder[]>(`/api/UserCertificate/certificate/${certificateId}/holders`);
    return response.data;
  }

  /**
   * Revoke a certificate assignment from a user
   * DELETE /api/UserCertificate/{userCertificateId}
   */
  async revokeCertificate(userCertificateId: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/api/UserCertificate/${userCertificateId}`);
    return response.data;
  }

  /**
   * Validate if a user has a specific certificate and it's active
   * GET /api/UserCertificate/validate/{userId}/{certificateId}
   */
  async validateCertificate(userId: string, certificateId: string): Promise<CertificateValidation> {
    const response = await api.get<CertificateValidation>(`/api/UserCertificate/validate/${userId}/${certificateId}`);
    return response.data;
  }

  /**
   * Get expiry status for a specific certificate
   * GET /api/UserCertificate/{certificateId}/expiry-status
   */
  async getCertificateExpiryStatus(certificateId: string): Promise<CertificateExpiryStatus> {
    const response = await api.get<CertificateExpiryStatus>(`/api/UserCertificate/${certificateId}/expiry-status`);
    return response.data;
  }

  /**
   * Get all technicians with their certificate information
   * GET /api/UserAccount/technicians
   */
  async getTechniciansWithCertificates(): Promise<TechnicianWithCertificates[]> {
    const response = await api.get<TechnicianWithCertificates[]>('/api/UserAccount/technicians');
    return response.data;
  }
}

export const userCertificateService = new UserCertificateService();
