import { api } from "./api";
import type { components } from "./schema";

// Transaction shape isn't defined in the OpenAPI schema export. Use unknown for now
export type TransactionDto = components["schemas"]["TransactionDto"];

type CreateTransactionDto = components["schemas"]["CreateTransactionDto"];
type UpdateTransactionStatusDto =
  components["schemas"]["UpdateTransactionStatusDto"];
/**
 * Get all transactions
 */
export async function getTransactions(): Promise<TransactionDto[]> {
  const { data } = await api.get<TransactionDto[]>("/Transaction");
  return data;
}

/**
 * Create a transaction
 */
export async function createTransaction(
  payload: CreateTransactionDto
): Promise<TransactionDto> {
  const { data } = await api.post<TransactionDto>("/Transaction", payload);
  return data;
}

/**
 * Get transaction by id
 */
export async function getTransactionById(id: string): Promise<TransactionDto> {
  const { data } = await api.get<TransactionDto>(`/Transaction/${id}`);
  return data;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  id: string,
  payload: UpdateTransactionStatusDto
): Promise<TransactionDto> {
  const { data } = await api.put<TransactionDto>(`/Transaction/${id}`, payload);
  return data;
}

/**
 * Delete transaction
 */
export async function deleteTransaction(id: string): Promise<boolean> {
  const { data } = await api.delete<boolean>(`/Transaction/${id}`);
  return data;
}

/**
 * Get transactions for a specific user
 */
export async function getTransactionsByUser(
  userId: string
): Promise<TransactionDto[]> {
  const { data } = await api.get<TransactionDto[]>(
    `/Transaction/${userId}/user`
  );
  return data;
}

/**
 * Get transactions for a specific order
 */
export async function getTransactionsByOrder(
  orderId: string
): Promise<TransactionDto[]> {
  const { data } = await api.get<TransactionDto[]>(
    `/Transaction/${orderId}/order`
  );
  return data;
}

/**
 * Cancel a transaction by orderCode
 */
export async function cancelTransaction(orderCode: number): Promise<boolean> {
  const { data } = await api.put<boolean>(`/Transaction/cancel/${orderCode}`);
  return data;
}

/**
 * Get transaction by payment ID (orderCode)
 */
export async function getTransactionByPaymentId(
  orderCode: number
): Promise<TransactionDto> {
  const { data } = await api.get<TransactionDto>(
    `/Transaction/paymentId/${orderCode}`
  );
  return data;
}

export const transactionService = {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction,
  getTransactionsByUser,
  getTransactionsByOrder,
  cancelTransaction,
  getTransactionByPaymentId,
};

export default transactionService;
