"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Mail } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { ReceiptDto } from "@/services/receiptService";

interface ReceiptDetailProps {
  receipt: ReceiptDto | null;
  isLoading?: boolean;
  onBack: () => void;
}

export default function ReceiptDetail({
  receipt,
  isLoading,
  onBack,
}: ReceiptDetailProps) {
  if (isLoading) {
    return <ReceiptDetailSkeleton onBack={onBack} />;
  }

  if (!receipt) {
    return (
      <div className="container mx-auto py-8">
        <Button
          variant="outline"
          className="mb-6 bg-transparent"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Không tìm thấy hóa đơn</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Tải PDF
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Gửi hóa đơn
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Receipt Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Hóa Đơn #{receipt.receiptId?.slice(0, 8)}</CardTitle>
                <CardDescription>
                  {formatDate(receipt.createdAt)}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Mã giao dịch</p>
                <p className="font-mono text-sm">
                  {receipt.transactionId?.slice(0, 8) || "-"}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Khách Hàng</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Tên Khách Hàng
              </p>
              <p className="font-medium">{receipt.customerFullName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Mã Khách Hàng
              </p>
              <p className="font-medium font-mono text-sm">
                {receipt.customerId?.slice(0, 8)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{receipt.customerEmail || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Số điện thoại
              </p>
              <p className="font-medium">{receipt.customerPhone || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Địa chỉ</p>
              <p className="font-medium">{receipt.customerAddress || "-"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receipt.items && receipt.items.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {receipt.items.map((item) => (
                      <div
                        key={item.receiptItemId}
                        className="flex items-center justify-between py-3 px-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{item.itemName}</p>
                            <Badge
                              variant={
                                item.itemType === "SERVICE"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {item.itemType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Số lượng: {item.quantity} ×{" "}
                            {formatCurrency(item.unitPrice || 0)}
                          </p>
                        </div>
                        <p className="font-semibold ml-4 min-w-fit">
                          {formatCurrency(item.lineTotal || 0)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-lg font-bold">
                      <p>Tổng Số Tiền</p>
                      <p className="text-primary">
                        {formatCurrency(receipt.totalAmount || 0)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Không có mặt hàng nào trong hóa đơn
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReceiptDetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full md:col-span-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
