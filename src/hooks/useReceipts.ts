/**
 * Custom hooks for Receipt management
 * Uses axios directly for data fetching
 */

import { useState, useEffect } from "react";
import { getMyReceipts, getReceiptById } from "@/services/receiptService";
import type { ReceiptDto } from "@/services/receiptService";

/**
 * Hook to fetch receipts for the currently authenticated user
 */
export function useMyReceipts() {
  const [data, setData] = useState<ReceiptDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setIsLoading(true);
        const receipts = await getMyReceipts();
        setData(receipts);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  return { data, isLoading, error };
}

/**
 * Hook to fetch a single receipt by ID
 */
export function useReceiptById(id: string) {
  const [data, setData] = useState<ReceiptDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchReceipt = async () => {
      try {
        setIsLoading(true);
        const receipt = await getReceiptById(id);
        setData(receipt);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipt();
  }, [id]);

  return { data, isLoading, error };
}
