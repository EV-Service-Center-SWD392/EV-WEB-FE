"use client";
import { useState } from "react";
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
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useTransactionById } from "@/hooks/useTransactions";
import { useParams, useRouter } from "next/navigation";
const getStatusColor = (status?: string | null) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "cancelled":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  }
};

export default function TransactionDetailPage() {
  const router = useRouter();
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const handleBack = () => {
    router.back();
  };
  const params = useParams();
  // Fetch transaction data from API
  const transactionId = params.id as string;

  const { data: transaction, isLoading } = useTransactionById(transactionId);

  if (isLoading) {
    return <TransactionDetailSkeleton />;
  }

  if (!transaction) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Transaction Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The transaction you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button
            variant="outline"
            className="mb-6 bg-transparent"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
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

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          className="mb-6 bg-transparent"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Transaction Details
          </h1>
          <p className="text-muted-foreground">
            Transaction ID: {transaction.transactionId}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
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
                    Cancellation Reason
                  </label>
                  <p className="mt-2 text-sm bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 p-3 rounded-md">
                    {transaction.reason}
                  </p>
                </div>
              )}

            {/* Order ID */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Order ID
              </label>
              <p className="mt-1 font-medium">{transaction.orderId || "-"}</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="mt-1 text-sm">{transaction.description || "-"}</p>
            </div>

            {/* Total Amount */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Total Amount
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
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment Method ID */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Payment Method ID
              </label>
              <p className="mt-1">{transaction.paymentMethodId || "-"}</p>
            </div>

            {/* Staff ID */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Staff ID
              </label>
              <p className="mt-1">{transaction.staffId || "-"}</p>
            </div>

            {/* Payment ID */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Payment ID
              </label>
              <p className="mt-1">{transaction.paymentId || "-"}</p>
            </div>

            {/* Created At */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created At
              </label>
              <p className="mt-1 text-sm">
                {formatDate(transaction.createdAt)}
              </p>
            </div>

            {/* Updated At */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Updated At
              </label>
              <p className="mt-1 text-sm">
                {formatDate(transaction.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Link Button */}
      {transaction.paymentlink && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <Button
              onClick={handlePaymentLinkClick}
              size="lg"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to Payment Link
            </Button>
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
            <AlertDialogTitle>Confirm Payment Redirect</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to be redirected to the payment gateway. Do you want
              to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 rounded-md my-4">
            <p className="text-sm font-medium">
              Amount: {formatCurrency(transaction.totalAmount || 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Order ID: {transaction.orderId}
            </p>
          </div>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmPayment}>
            Proceed to Payment
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
