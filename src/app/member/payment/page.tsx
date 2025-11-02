"use client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useTransactionsByUser } from "@/hooks/useTransactions";
import TransactionTable from "@/components/pages/payment/TransactionTable";

export default function TransactionPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: transactions, isLoading } = useTransactionsByUser(
    user?.id || ""
  );

  const handleViewDetails = (transactionId?: string) => {
    if (transactionId) {
      router.push(`/member/payment/${transactionId}`);
    }
  };

  return (
    <TransactionTable
      transactions={transactions || []}
      isLoading={isLoading}
      handleViewDetails={handleViewDetails}
    />
  );
}
