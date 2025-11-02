"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PaymentMethodSelector from "@/components/pages/payment/PaymentMethodSelector";
import {
  createTransaction,
  getTransactionsByOrder,
} from "@/services/transactionService";
import { useAuthStore } from "@/stores/auth";
import { ArrowLeft } from "lucide-react";

export default function StaffCreatePaymentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orderId, setOrderId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  const handleOrderIdSubmit = async () => {
    if (!orderId.trim()) {
      setError("Vui lòng nhập Order ID");
      return;
    }
    if (!user?.id) {
      setError("Không tìm thấy thông tin người dùng");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Check if there's an existing transaction for this order
      const existingTransactions = await getTransactionsByOrder(orderId);

      // Check for paid transaction first - redirect to receipt
      const paidTransaction = existingTransactions.find(
        (t) => t.status?.toLowerCase() === "paid"
      );

      if (paidTransaction && paidTransaction.receiptId) {
        // Redirect to receipt page with flag
        router.push(
          `/staff/receipt/${paidTransaction.receiptId}?alreadyPaid=true`
        );
        return;
      }

      // Check for created transaction - redirect to transaction detail
      const createdTransaction = existingTransactions.find(
        (t) => t.status?.toLowerCase() === "created"
      );

      if (createdTransaction) {
        // Redirect to existing transaction
        router.push(
          `/staff/payment/${createdTransaction.transactionId}?fromCreatePage=true`
        );
        return;
      }

      // No existing transaction, proceed to payment method selection
      setError(null);
      setShowPaymentMethod(true);
    } catch (err) {
      console.error("Failed to check existing transactions:", err);
      // If error checking, still allow to proceed
      setError(null);
      setShowPaymentMethod(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPaymentMethod = async (methodId: number) => {
    if (!user?.id) {
      setError("Không tìm thấy thông tin người dùng");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Create transaction for staff (include staffId)
      const transaction = await createTransaction({
        orderId: orderId,
        paymentMethodId: methodId,
        staffId: user.id, // Staff ID from auth state
      });

      // Redirect to payment detail page
      router.push(`/staff/payment/${transaction.transactionId}`);
    } catch (err) {
      console.error("Failed to create transaction:", err);
      setError("Không thể tạo giao dịch. Vui lòng thử lại.");
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (showPaymentMethod) {
      setShowPaymentMethod(false);
    } else {
      router.back();
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Button
        variant="outline"
        className="mb-6 bg-transparent"
        onClick={handleBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Tạo Giao Dịch Thanh Toán
        </h1>
        <p className="text-muted-foreground">
          Nhập Order ID và chọn phương thức thanh toán cho khách hàng
        </p>
      </div>

      {user && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>Nhân viên:</strong> {user.name} ({user.email})
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!showPaymentMethod ? (
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Đơn Hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                type="text"
                placeholder="Nhập Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleOrderIdSubmit();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleOrderIdSubmit}
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? "Đang kiểm tra..." : "Tiếp tục"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <PaymentMethodSelector
          onSelectPaymentMethod={handleSelectPaymentMethod}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
