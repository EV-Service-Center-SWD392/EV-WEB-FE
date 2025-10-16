/**
 * Hook for searching customers
 */

import { useState, useCallback } from 'react';

import type { Customer } from '../types/domain';
import { customersService } from '../services/customers';

export const useCustomerSearch = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setCustomers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await customersService.searchCustomers({ q: query, limit: 10 });
      setCustomers(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setCustomers([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    customers,
    isLoading,
    error,
    search,
    reset,
  };
};
