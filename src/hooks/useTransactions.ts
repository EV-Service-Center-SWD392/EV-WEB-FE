/**
 * Custom hooks for Transaction management
 * Uses axios directly for data fetching
 */

import { useState, useEffect } from "react";
import {
  getTransactionsByUser,
  getTransactionById,
} from "@/services/transactionService";
import type { TransactionDto } from "@/services/transactionService";

/**
 * Hook to fetch transactions for a specific user
 */
export function useTransactionsByUser(userId: string) {
  const [data, setData] = useState<TransactionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const transactions = await getTransactionsByUser(userId);
        setData(transactions);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  return { data, isLoading, error };
}

/**
 * Hook to fetch a single transaction by ID
 */
export function useTransactionById(id: string) {
  const [data, setData] = useState<TransactionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchTransaction = async () => {
      try {
        setIsLoading(true);
        const transaction = await getTransactionById(id);
        setData(transaction);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  return { data, isLoading, error };
}
