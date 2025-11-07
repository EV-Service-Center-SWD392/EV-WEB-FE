import { api } from './api';
import type { 
  Technician, 
  CreateTechnicianDto, 
  UpdateTechnicianDto,
  TechnicianFilters 
} from '@/entities/technician.types';

class TechnicianService {
  // Get all technicians with certificate information
  async getTechnicians(filters?: TechnicianFilters): Promise<Technician[]> {
    const response = await api.get('/api/UserAccount/technicians', { params: filters });
    return response.data;
  }

  // Get all users (broader than just technicians)
  async getAllUsers(filters?: TechnicianFilters): Promise<Technician[]> {
    const response = await api.get('/api/UserAccount', { params: filters });
    return response.data;
  }

  // Get technician by ID
  async getTechnicianById(id: string): Promise<Technician> {
    const response = await api.get(`/api/UserAccount/${id}`);
    return response.data;
  }

  // Create new technician
  async createTechnician(data: CreateTechnicianDto): Promise<Technician> {
    const response = await api.post('/api/UserAccount', data);
    return response.data;
  }

  // Update technician
  async updateTechnician(id: string, data: UpdateTechnicianDto): Promise<Technician> {
    const response = await api.put(`/api/UserAccount/${id}`, data);
    return response.data;
  }

  // Delete technician (soft delete)
  async deleteTechnician(id: string): Promise<void> {
    await api.delete(`/api/UserAccount/${id}`);
  }

  // Update technician role
  async updateTechnicianRole(id: string, roleId: string): Promise<void> {
    await api.put(`/api/UserAccount/${id}/role`, { roleId });
  }
}

export const technicianService = new TechnicianService();