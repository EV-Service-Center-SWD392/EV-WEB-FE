/**
 * Hook for quick customer creation
 */

import { useState, useCallback } from 'react';

import type { Customer } from '../types/domain';
import type { QuickCustomerDTO } from '../types/dto';
import { customersService } from '../services/customers';

export const useQuickCreateCustomer = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCustomer = useCallback(async (dto: QuickCustomerDTO): Promise<Customer | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const customer = await customersService.createCustomer(dto);
      return customer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer';
      setError(errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsCreating(false);
  }, []);

  return {
    createCustomer,
    isCreating,
    error,
    reset,
  };
};
