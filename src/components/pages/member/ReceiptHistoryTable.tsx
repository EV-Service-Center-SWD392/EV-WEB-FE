"use client";
import { useRouter } from "next/navigation";
import { useMyReceipts } from "@/hooks/useReceipts";
import ReceiptTable from "@/components/ui/ReceiptTable";

export default function ReceiptHistoryTable() {
  const router = useRouter();
  const { data: receipts, isLoading } = useMyReceipts();

  const handleViewDetails = (receiptId?: string) => {
    if (receiptId) {
      router.push(`/member/receipt/${receiptId}`);
    }
  };

  return (
    <ReceiptTable
      receipts={receipts || []}
      isLoading={isLoading}
      handleViewDetails={handleViewDetails}
    />
  );
}
