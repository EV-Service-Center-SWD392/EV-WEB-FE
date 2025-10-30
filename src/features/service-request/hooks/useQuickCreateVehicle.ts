/**
 * Hook for quick vehicle creation
 */

import { useState, useCallback } from 'react';

import type { Vehicle } from '../types/domain';
import type { QuickVehicleDTO } from '../types/dto';
import { vehiclesService } from '../services/vehicles';

export const useQuickCreateVehicle = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVehicle = useCallback(async (dto: QuickVehicleDTO): Promise<Vehicle | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const vehicle = await vehiclesService.createVehicle(dto);
      return vehicle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vehicle';
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
    createVehicle,
    isCreating,
    error,
    reset,
  };
};
