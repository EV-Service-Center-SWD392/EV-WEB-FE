"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { usePaymentReturn } from "@/hooks/useTransactions";
import { TransactionDto } from "@/services/transactionService";

const PaymentReturn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { isProcessing, cancelByOrderCode, getTransactionByOrderCode } =
    usePaymentReturn();

  const [status, setStatus] = useState<"processing" | "success" | "failed">(
    "processing"
  );
  const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...");

  const [transaction, setTransaction] = useState<TransactionDto | null>(null);
  // Get parameters from the URL
  const code = searchParams.get("code");
  const cancel = searchParams.get("cancel");
  const paymentStatus = searchParams.get("status");
  const orderCode = searchParams.get("orderCode");

  useEffect(() => {
    const processPaymentReturn = async () => {
      // Check if payment was cancelled
      if (cancel === "true" && orderCode) {
        setMessage("Đang hủy giao dịch...");

        // Cancel the transaction
        const cancelSuccess = await cancelByOrderCode(parseInt(orderCode));

        if (cancelSuccess) {
          // Get transaction to retrieve the ID for redirect
          const transaction = await getTransactionByOrderCode(
            parseInt(orderCode)
          );

          if (transaction) {
            const isStaff = user?.role === "staff" || user?.role === "admin";
            const redirectPath = isStaff
              ? `/staff/payment/${transaction.transactionId}`
              : `/member/payment/${transaction.transactionId}`;
            setTransaction(transaction);
            setStatus("failed");
            setMessage(
              "Thanh toán đã bị hủy. Đang chuyển hướng về trang chi tiết giao dịch..."
            );

            setTimeout(() => {
              router.push(redirectPath);
            }, 2000);
          } else {
            setStatus("failed");
            setMessage("Không thể lấy thông tin giao dịch.");
          }
        } else {
          setStatus("failed");
          setMessage("Không thể hủy giao dịch. Vui lòng thử lại.");
        }
        return;
      }

      // Check if payment was successful
      if (paymentStatus === "PAID" && cancel === "false" && orderCode) {
        setMessage("Thanh toán thành công! Đang chuyển hướng...");

        // Get transaction to retrieve the Receipt ID
        const transaction = await getTransactionByOrderCode(
          parseInt(orderCode)
        );

        if (transaction && transaction.receiptId) {
          const isStaff = user?.role === "staff" || user?.role === "admin";
          const redirectPath = isStaff
            ? `/staff/receipt/${transaction.receiptId}`
            : `/member/receipt/${transaction.receiptId}`;

          setTransaction(transaction);
          setStatus("success");
          setMessage("Thanh toán thành công! Đang chuyển hướng đến hóa đơn...");

          setTimeout(() => {
            router.push(redirectPath);
          }, 2000);
        } else {
          setStatus("failed");
          setMessage("Không thể lấy thông tin hóa đơn.");
        }
        return;
      }

      // Handle failed payment or invalid parameters
      if (code || paymentStatus || orderCode) {
        setStatus("failed");
        setMessage("Có lỗi xảy ra trong quá trình thanh toán.");

        if (orderCode) {
          // Try to get transaction for redirect
          const transaction = await getTransactionByOrderCode(
            parseInt(orderCode)
          );

          if (transaction) {
            const isStaff = user?.role === "staff" || user?.role === "admin";
            const redirectPath = isStaff
              ? `/staff/payment/${transaction.transactionId}`
              : `/member/payment/${transaction.transactionId}`;

            setTimeout(() => {
              router.push(redirectPath);
            }, 3000);
          }
        }
      }
    };

    processPaymentReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            {status === "processing" && (
              <>
                <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600 mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Đang xử lý
                </h2>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-6">
                  <svg
                    className="h-10 w-10 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-boldtext-green-400 mb-2">
                  Đơn hàng {transaction?.transactionId} thanh toán thành công
                </h2>
              </>
            )}

            {status === "failed" && (
              <>
                <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
                  <svg
                    className="h-10 w-10 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-600  mb-2">
                  Đơn hàng {transaction?.transactionId} hủy thành công thất bại
                </h2>
              </>
            )}

            <p className="text-gray-300 mt-4">{message}</p>

            {isProcessing && (
              <div className="mt-4">
                <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReturn;
