"use client";
import { useParams, useRouter } from "next/navigation";
import { useTransactionById } from "@/hooks/useTransactions";
import TransactionDetail from "@/components/pages/payment/TransactionDetail";

export default function StaffTransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const { data: transaction, isLoading } = useTransactionById(transactionId);

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <TransactionDetail
      transaction={transaction}
      isLoading={isLoading}
      onBack={handleBack}
      onRefresh={handleRefresh}
      isCustomer={false}
    />
  );
}
