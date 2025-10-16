/**
 * Hook for checking blacklist status
 */

import { useState, useCallback } from 'react';

import type { BlacklistCheckResult } from '../types/domain';
import { riskService } from '../services/risk';

export const useBlacklistCheck = () => {
  const [result, setResult] = useState<BlacklistCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(
    async (input: { phone?: string; email?: string; customerId?: string }) => {
      setIsChecking(true);
      setError(null);

      try {
        const checkResult = await riskService.checkBlacklist(input);
        setResult(checkResult);
        return checkResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Blacklist check failed';
        setError(errorMessage);
        // Return non-flagged on error (fail-open)
        const fallbackResult: BlacklistCheckResult = { flagged: false };
        setResult(fallbackResult);
        return fallbackResult;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsChecking(false);
  }, []);

  return {
    result,
    isChecking,
    error,
    check,
    reset,
  };
};
