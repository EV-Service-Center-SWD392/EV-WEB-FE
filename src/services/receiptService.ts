import { api } from "./api";
import { components } from "./schema";
// Receipt shape isn't defined in the OpenAPI schema export. Use unknown for now
export type ReceiptDto = components["schemas"]["ReceiptDto"];
export type ReceiptItemDto = components["schemas"]["ReceiptItemDto"];
/**
 * Get all receipts
 */
export async function getReceipts(): Promise<ReceiptDto[]> {
  const { data } = await api.get<ReceiptDto[]>("/Receipt");
  return data;
}

/**
 * Get receipt by id
 */
export async function getReceiptById(id: string): Promise<ReceiptDto> {
  const { data } = await api.get<ReceiptDto>(`/Receipt/${id}`);
  return data;
}

/**
 * Get receipts for a specific customer
 */
export async function getReceiptsByCustomer(
  customerId: string
): Promise<ReceiptDto[]> {
  const { data } = await api.get<ReceiptDto[]>(
    `/Receipt/customer/${customerId}`
  );
  return data;
}

/**
 * Get receipts for the currently authenticated user
 */
export async function getMyReceipts(): Promise<ReceiptDto[]> {
  const { data } = await api.get<ReceiptDto[]>(`/Receipt/me`);
  return data;
}

export const receiptService = {
  getReceipts,
  getReceiptById,
  getReceiptsByCustomer,
  getMyReceipts,
};

export default receiptService;
