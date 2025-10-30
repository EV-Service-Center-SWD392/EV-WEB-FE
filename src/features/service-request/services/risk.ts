/**
 * Risk & Blacklist API client
 * Optional feature for checking customer risk factors
 */

import { api } from '@/services/api';

import type { BlacklistCheckResult } from '../types/domain';

const BASE_PATH = '/api/risk';

export const riskService = {
  /**
   * Check if a customer is blacklisted
   */
  async checkBlacklist(input: {
    phone?: string;
    email?: string;
    customerId?: string;
  }): Promise<BlacklistCheckResult> {
    try {
      const response = await api.post<BlacklistCheckResult>(`${BASE_PATH}/blacklist-check`, input);
      return response.data;
    } catch (error) {
      // If the endpoint doesn't exist, return not flagged
      console.warn('Blacklist check endpoint not available:', error);
      return {
        flagged: false,
      };
    }
  },

  /**
   * Get risk score for a customer
   */
  async getRiskScore(customerId: string): Promise<{
    score: number;
    factors: string[];
  }> {
    try {
      const response = await api.get<{
        score: number;
        factors: string[];
      }>(`${BASE_PATH}/score/${customerId}`);
      return response.data;
    } catch (error) {
      console.warn('Risk score endpoint not available:', error);
      return {
        score: 0,
        factors: [],
      };
    }
  },
};
