/**
 * Customer API client
 */

import { api } from '@/services/api';

import type { Customer } from '../types/domain';
import type { QuickCustomerDTO, SearchCustomersParams } from '../types/dto';
import type { Vehicle } from '../types/domain';

const BASE_PATH = '/api/customers';

export const customersService = {
  /**
   * Search customers by query (phone, email, or name)
   */
  async searchCustomers(params: SearchCustomersParams): Promise<Customer[]> {
    const response = await api.get<Customer[]>(`${BASE_PATH}/search`, {
      params: {
        q: params.q,
        limit: params.limit ?? 10,
      },
    });
    return response.data;
  },

  /**
   * Create a new customer (quick create)
   */
  async createCustomer(dto: QuickCustomerDTO): Promise<Customer> {
    const response = await api.post<Customer>(BASE_PATH, dto);
    return response.data;
  },

  /**
   * Get a customer by ID
   */
  async getCustomer(id: string): Promise<Customer> {
    const response = await api.get<Customer>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Get customer's vehicles
   */
  async getCustomerVehicles(customerId: string): Promise<Vehicle[]> {
    const response = await api.get<Vehicle[]>(`${BASE_PATH}/${customerId}/vehicles`);
    return response.data;
  },
};
