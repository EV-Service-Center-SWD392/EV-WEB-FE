import { formatDate, formatCurrency } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../ui/table";
import type { ReceiptDto } from "@/services/receiptService";

interface ReceiptTableProps {
  receipts: ReceiptDto[] | [];
  isLoading?: boolean;
  handleViewDetails: (_receiptId?: string) => void;
}

export default function ReceiptTable({
  receipts,
  isLoading,
  handleViewDetails,
}: ReceiptTableProps) {
  if (isLoading) {
    return <ReceiptTableSkeleton />;
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Mã hóa đơn</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Khách Hàng</TableHead>
            <TableHead>Mã thanh toán</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!receipts || receipts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No receipts found
              </TableCell>
            </TableRow>
          ) : (
            receipts.map((receipt) => (
              <TableRow key={receipt.receiptId} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {receipt.receiptId}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(receipt.totalAmount || 0)}
                </TableCell>
                <TableCell>{receipt.customerFullName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {receipt.transactionId || "-"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(receipt.createdAt)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleViewDetails(receipt.receiptId)}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function ReceiptTableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Mã hóa đơn</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Mã thanh toán</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
