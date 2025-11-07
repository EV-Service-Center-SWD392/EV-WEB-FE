import { api } from './api';
import type { 
  Certificate, 
  CreateCertificateDto, 
  UpdateCertificateDto,
  CertificateFilters,
  ApiResponse
} from '@/entities/certificate.types';

/**
 * Certificate Service
 * Handles all Certificate-related API calls (/api/Certificate/*)
 */
class CertificateService {
  /**
   * Get all certificates in the system
   * GET /api/Certificate
   */
  async getCertificates(filters?: CertificateFilters): Promise<Certificate[]> {
    const response = await api.get<Certificate[]>('/api/Certificate', { params: filters });
    return response.data;
  }

  /**
   * Get only active certificates
   * GET /api/Certificate/active
   */
  async getActiveCertificates(): Promise<Certificate[]> {
    const response = await api.get<Certificate[]>('/api/Certificate/active');
    return response.data;
  }

  /**
   * Get a specific certificate by ID
   * GET /api/Certificate/{id}
   */
  async getCertificateById(id: string): Promise<Certificate> {
    const response = await api.get<Certificate>(`/api/Certificate/${id}`);
    return response.data;
  }

  /**
   * Create a new certificate
   * POST /api/Certificate
   */
  async createCertificate(data: CreateCertificateDto): Promise<Certificate> {
    const response = await api.post<Certificate>('/api/Certificate', data);
    return response.data;
  }

  /**
   * Update an existing certificate
   * PUT /api/Certificate/{id}
   */
  async updateCertificate(id: string, data: UpdateCertificateDto): Promise<Certificate> {
    const response = await api.put<Certificate>(`/api/Certificate/${id}`, data);
    return response.data;
  }

  /**
   * Delete a certificate (soft delete)
   * DELETE /api/Certificate/{id}
   */
  async deleteCertificate(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/api/Certificate/${id}`);
    return response.data;
  }
}

export const certificateService = new CertificateService();