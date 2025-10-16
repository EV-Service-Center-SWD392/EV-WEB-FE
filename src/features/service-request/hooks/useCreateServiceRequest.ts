/**
 * Hook for creating service requests with error handling and retry logic
 */

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

import type { ServiceRequest } from '../types/domain';
import type { CreateServiceRequestDTO, ApiFieldError } from '../types/dto';
import { requestsService } from '../services/requests';

interface UseCreateServiceRequestReturn {
  createRequest: (_dto: CreateServiceRequestDTO) => Promise<ServiceRequest | null>;
  isCreating: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  duplicateRequestId: string | null;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useCreateServiceRequest = (): UseCreateServiceRequestReturn => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [duplicateRequestId, setDuplicateRequestId] = useState<string | null>(null);

  const createRequest = useCallback(
    async (dto: CreateServiceRequestDTO, retryCount = 0): Promise<ServiceRequest | null> => {
      setIsCreating(true);
      setError(null);
      setFieldErrors({});
      setDuplicateRequestId(null);

      try {
        const request = await requestsService.postServiceRequest(dto);
        return request;
      } catch (err) {
        if (err instanceof AxiosError) {
          const status = err.response?.status;
          const data = err.response?.data;

          // 400: Validation errors
          if (status === 400 && data?.errors) {
            const errors: Record<string, string> = {};
            (data.errors as ApiFieldError[]).forEach((fieldError) => {
              const fieldName = fieldError.path.join('.');
              errors[fieldName] = fieldError.message;
            });
            setFieldErrors(errors);
            setError('Please fix the validation errors');
            return null;
          }

          // 409: Duplicate request
          if (status === 409) {
            const existingId = data?.existingRequestId;
            if (existingId) {
              setDuplicateRequestId(existingId);
              setError('A similar request already exists');
            } else {
              setError('Duplicate request detected');
            }
            return null;
          }

          // 5xx: Server errors with retry
          if (status && status >= 500 && retryCount < 3) {
            const backoffMs = Math.pow(2, retryCount) * 1000; // Exponential backoff
            await sleep(backoffMs);
            return createRequest(dto, retryCount + 1);
          }

          setError(data?.message || err.message || 'Failed to create request');
        } else {
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }

        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setError(null);
    setFieldErrors({});
    setDuplicateRequestId(null);
    setIsCreating(false);
  }, []);

  return {
    createRequest,
    isCreating,
    error,
    fieldErrors,
    duplicateRequestId,
    reset,
  };
};
