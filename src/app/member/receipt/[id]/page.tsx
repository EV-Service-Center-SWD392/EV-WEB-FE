"use client";

import { useParams, useRouter } from "next/navigation";
import { useReceiptById } from "@/hooks/useReceipts";
import ReceiptDetail from "@/components/ui/ReceiptDetail";

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const receiptId = params.id as string;

  const { data: receipt, isLoading } = useReceiptById(receiptId);

  const handleBack = () => {
    router.back();
  };

  return (
    <ReceiptDetail receipt={receipt} isLoading={isLoading} onBack={handleBack} />
  );
}
