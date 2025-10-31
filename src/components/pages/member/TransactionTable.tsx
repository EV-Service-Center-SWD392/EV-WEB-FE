"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { components } from "@/services/schema";

type TransactionDto = components["schemas"]["TransactionDto"];
// Mock data - replace with actual API call
const MOCK_TRANSACTIONS: TransactionDto[] = [
  {
    transactionId: "TXN001",
    orderId: "ORD001",
    description: "Product Purchase",
    totalAmount: 150.99,
    status: "completed",
    createdAt: new Date().toISOString(),
  },
  {
    transactionId: "TXN002",
    orderId: "ORD002",
    description: "Subscription Payment",
    totalAmount: 29.99,
    status: "completed",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    transactionId: "TXN003",
    orderId: "ORD003",
    description: "Refund",
    totalAmount: 50.0,
    status: "pending",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const getStatusColor = (status?: string | null) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export default function TransactionTable() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Mã thanh toán</TableHead>
            <TableHead>Mã đơn hàng</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_TRANSACTIONS.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            MOCK_TRANSACTIONS.map((transaction) => (
              <TableRow
                key={transaction.transactionId}
                className="hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  {transaction.transactionId}
                </TableCell>
                <TableCell>{transaction.orderId || "-"}</TableCell>
                <TableCell>{transaction.description || "-"}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(transaction.totalAmount || 0)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusColor(transaction.status)}
                  >
                    {transaction.status || "unknown"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(transaction.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
