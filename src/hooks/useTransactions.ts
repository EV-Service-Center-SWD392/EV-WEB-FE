/**
 * Custom hooks for Transaction management
 * Uses axios directly for data fetching
 */

import { useState, useEffect } from "react";
import {
  getTransactionsByUser,
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction,
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

/**
 * Hook for transaction management operations
 * Handles update status, cancel, and delete operations
 */
export function useTransactionManagement() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Cancel transaction (for customers)
   * Updates transaction status to "cancelled"
   */
  const cancelTransaction = async (transactionId: string): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setError(null);
      await updateTransactionStatus(transactionId, { status: "cancelled" });
      return true;
    } catch (err) {
      setError(err as Error);
      console.error("Error canceling transaction:", err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Delete transaction (for staff)
   * Completely removes the transaction
   */
  const removeTransaction = async (transactionId: string): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setError(null);
      await updateTransactionStatus(transactionId, { status: "cancelled" });
      return true;
    } catch (err) {
      setError(err as Error);
      console.error("Error confirming payment:", err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Confirm payment (for staff)
   * Updates transaction status to "paid"
   */
  const confirmPayment = async (transactionId: string): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setError(null);
      await updateTransactionStatus(transactionId, { status: "paid" });
      return true;
    } catch (err) {
      setError(err as Error);
      console.error("Error confirming payment:", err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Update transaction status (generic)
   */
  const updateStatus = async (
    transactionId: string,
    status: string
  ): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setError(null);
      await updateTransactionStatus(transactionId, { status });
      return true;
    } catch (err) {
      setError(err as Error);
      console.error("Error updating transaction status:", err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    cancelTransaction,
    removeTransaction,
    confirmPayment,
    updateStatus,
  };
}
