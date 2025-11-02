"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type { TransactionDto } from "@/services/transactionService";
import { useTransactionManagement } from "@/hooks/useTransactions";

interface TransactionDetailProps {
  transaction?: TransactionDto | null;
  isLoading: boolean;
  onBack: () => void;
  onRefresh?: () => void;
  isCustomer?: boolean;
}

const getStatusColor = (status?: string | null) => {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-white dark:bg-green-900 dark:text-white-200";
    case "created":
      return "bg-blue-100 text-white dark:bg-blue-900 dark:text-white-200";
    case "cancelled":
      return "bg-red-100 text-white dark:bg-red-900 dark:text-white-200";
    default:
      return "bg-gray-100 text-white-800 dark:bg-gray-900 dark:text-white-200";
  }
};

export default function TransactionDetail({
  transaction,
  isLoading,
  onBack,
  onRefresh,
  isCustomer = true,
}: TransactionDetailProps) {
  const searchParams = useSearchParams();
  const fromCreatePage = searchParams.get("fromCreatePage") === "true";

  const { isProcessing, cancelTransaction, removeTransaction, confirmPayment } =
    useTransactionManagement();

  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showConfirmPaymentDialog, setShowConfirmPaymentDialog] =
    useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Show warning message if redirected from create page
  useEffect(() => {
    if (fromCreatePage && transaction?.status?.toLowerCase() === "created") {
      setShowWarning(true);
    }
  }, [fromCreatePage, transaction]);

  if (isLoading) {
    return <TransactionDetailSkeleton />;
  }

  if (!transaction) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Không tìm thấy giao dịch
          </h2>
          <p className="text-muted-foreground mb-6">
            Giao dịch mà bạn đang tìm kiếm không tồn tại.
          </p>
          <Button
            variant="outline"
            className="mb-6 bg-transparent"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const handlePaymentLinkClick = () => {
    setShowPaymentConfirm(true);
  };

  const handleConfirmPayment = () => {
    setShowPaymentConfirm(false);
    if (transaction.paymentlink) {
      window.open(transaction.paymentlink, "_blank");
    }
  };

  const handleCancelTransaction = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (!transaction?.transactionId) return;

    let success = false;
    if (isCustomer) {
      // Customer: Update status to cancelled
      success = await removeTransaction(transaction.transactionId);
    } else {
      // Staff: Delete transaction
      success = await cancelTransaction(transaction.transactionId);
    }

    if (success) {
      setShowCancelConfirm(false);
      // Refresh the page after cancellation
      if (onRefresh) {
        onRefresh();
      }
      // Force a small delay to ensure the refresh happens
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      alert("Không thể hủy giao dịch. Vui lòng thử lại.");
    }
  };

  const handleConfirmPaymentClick = () => {
    setShowConfirmPaymentDialog(true);
  };

  const handleConfirmPaymentStatus = async () => {
    if (!transaction?.transactionId) return;

    const success = await confirmPayment(transaction.transactionId);

    if (success) {
      setShowConfirmPaymentDialog(false);
      // Refresh the page after confirmation
      if (onRefresh) {
        onRefresh();
      }
      // Force a small delay to ensure the refresh happens
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      alert("Không thể xác nhận thanh toán. Vui lòng thử lại.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          className="mb-6 bg-transparent"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Chi Tiết Giao Dịch
          </h1>
          <p className="text-muted-foreground">
            Mã Giao Dịch: {transaction.transactionId}
          </p>
        </div>
      </div>

      {/* Warning Message - Show when redirected from create page */}
      {showWarning && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-md flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              Giao dịch chưa xử lý
            </p>
            <p className="text-sm text-yellow-700  mt-1">
              Bạn đang có giao dịch chưa xử lý. Hãy tiến hành thanh toán hoặc
              hủy nếu muốn tạo giao dịch mới.
            </p>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Giao Dịch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Trạng Thái
              </label>
              <div className="mt-2">
                <Badge className={getStatusColor(transaction.status)}>
                  {transaction.status?.toUpperCase() || "UNKNOWN"}
                </Badge>
              </div>
            </div>

            {transaction.status?.toLowerCase() === "cancelled" &&
              transaction.reason && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Lý do hủy
                  </label>
                  <p className="mt-2 text-sm bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 p-3 rounded-md">
                    {transaction.reason}
                  </p>
                </div>
              )}

            {/* Receipt ID - Show when status is paid */}
            {transaction.status?.toLowerCase() === "paid" &&
              transaction.receiptId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Mã Hóa Đơn
                  </label>
                  <Link
                    href={
                      isCustomer
                        ? `/member/receipt/${transaction.receiptId}`
                        : `/staff/receipt/${transaction.receiptId}`
                    }
                    className="mt-1 flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    {transaction.receiptId}
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              )}

            {/* Order ID */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Mã Đơn Hàng
              </label>
              <p className="mt-1 font-medium">{transaction.orderId || "-"}</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Mô Tả
              </label>
              <p className="mt-1 text-sm">{transaction.description || "-"}</p>
            </div>

            {/* Total Amount */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tổng Số Tiền
              </label>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatCurrency(transaction.totalAmount || 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Bổ Sung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment Method ID */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Phương Thức Thanh Toán
              </label>
              <p className="mt-1">{transaction.paymentMethodName || "-"}</p>
            </div>

            {/* Staff ID */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Mã Nhân Viên
              </label>
              <p className="mt-1">{transaction.staffId || "-"}</p>
            </div>

            {/* Payment ID */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Mã Thanh Toán
              </label>
              <p className="mt-1">{transaction.paymentId || "-"}</p>
            </div>

            {/* Created At */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Ngày Tạo
              </label>
              <p className="mt-1 text-sm">
                {formatDate(transaction.createdAt)}
              </p>
            </div>

            {/* Updated At */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Ngày Cập Nhật
              </label>
              <p className="mt-1 text-sm">
                {formatDate(transaction.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons - Only show if status is "Created" */}
      {transaction.status?.toLowerCase() === "created" && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              {/* Go to Payment Link - only show if paymentlink exists */}
              {transaction.paymentlink && isCustomer && (
                <Button
                  onClick={handlePaymentLinkClick}
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Đến trang thanh toán
                </Button>
              )}
              {/* Confirm Payment - only show if no paymentlink and not customer (staff) */}
              {!transaction.paymentlink && !isCustomer && (
                <Button
                  onClick={handleConfirmPaymentClick}
                  size="lg"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isProcessing}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Xác Nhận Thanh Toán
                </Button>
              )}
              {/* Cancel Transaction - always show when status is created */}
              <Button
                onClick={handleCancelTransaction}
                size="lg"
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={isProcessing}
              >
                Hủy Giao Dịch
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Confirmation Alert */}
      <AlertDialog
        open={showPaymentConfirm}
        onOpenChange={setShowPaymentConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xác Nhận Chuyển Hướng Thanh Toán
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp được chuyển hướng đến cổng thanh toán. Bạn có muốn tiếp
              tục không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 rounded-md my-4">
            <p className="text-sm font-medium">
              Số Tiền: {formatCurrency(transaction.totalAmount || 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Mã Đơn Hàng: {transaction.orderId}
            </p>
          </div>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmPayment}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-600 text-white"
          >
            Tiến Hành Thanh Toán
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Transaction Confirmation Alert */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Hủy Giao Dịch</AlertDialogTitle>
            <AlertDialogDescription>
              {isCustomer
                ? "Bạn có chắc chắn muốn hủy giao dịch này không? Hành động này không thể hoàn tác."
                : "Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này sẽ xóa vĩnh viễn giao dịch khỏi hệ thống."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 rounded-md my-4 bg-red-50 dark:bg-red-950">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Số Tiền: {formatCurrency(transaction.totalAmount || 0)}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Mã Giao Dịch: {transaction.transactionId}
            </p>
          </div>
          <AlertDialogCancel disabled={isProcessing}>
            Quay Lại
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmCancel}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isProcessing}
          >
            {isProcessing
              ? "Đang xử lý..."
              : isCustomer
                ? "Có, Hủy Giao Dịch"
                : "Có, Xóa Giao Dịch"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Payment Dialog - Staff only */}
      <AlertDialog
        open={showConfirmPaymentDialog}
        onOpenChange={setShowConfirmPaymentDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Thanh Toán</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xác nhận thanh toán cho giao dịch này không?
              Trạng thái giao dịch sẽ được cập nhật thành &quot;Đã Thanh
              Toán&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 rounded-md my-4 bg-green-50 dark:bg-green-950">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Số Tiền: {formatCurrency(transaction.totalAmount || 0)}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Mã giao dịch: {transaction.transactionId}
            </p>
          </div>
          <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmPaymentStatus}
            className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-600"
            disabled={isProcessing}
          >
            {isProcessing ? "Đang xử lý..." : "Xác Nhận Thanh Toán"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TransactionDetailSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Skeleton className="h-9 w-24 mb-4" />
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-8 w-40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
