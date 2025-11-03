import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { TransactionDto } from "@/services/transactionService";

type SortField = "status" | "createdAt";
type SortOrder = "asc" | "desc" | null;

const getStatusColor = (status?: string | null) => {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-200";
    case "created":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-200";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200";
  }
};

interface TransactionTableProps {
  transactions: TransactionDto[];
  isLoading?: boolean;
  handleViewDetails: (_transactionId?: string) => void;
}

export default function TransactionTable({
  transactions,
  isLoading,
  handleViewDetails,
}: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Sort transactions based on selected field and order
  const sortedTransactions = useMemo(() => {
    if (!transactions || !sortField || !sortOrder) return transactions;

    return [...transactions].sort((a, b) => {
      let comparison = 0;

      if (sortField === "status") {
        const statusA = (a.status || "").toLowerCase();
        const statusB = (b.status || "").toLowerCase();
        comparison = statusA.localeCompare(statusB);
      } else if (sortField === "createdAt") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        comparison = dateA - dateB;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [transactions, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <span className="inline-flex ml-1">
          <span className="text-[6px] leading-none text-muted-foreground">
            ▲
          </span>
          <span className="text-[6px] leading-none text-muted-foreground">
            ▼
          </span>
        </span>
      );
    }
    if (sortOrder === "asc") {
      return <span className="ml-1 text-xs">▲</span>;
    }
    if (sortOrder === "desc") {
      return <span className="ml-1 text-xs">▼</span>;
    }
    return (
      <span className="inline-flex flex-col ml-1">
        <span className="text-[6px] leading-none text-muted-foreground">▲</span>
        <span className="text-[6px] leading-none text-muted-foreground">▼</span>
      </span>
    );
  };

  if (isLoading) {
    return <TransactionTableSkeleton />;
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Mã thanh toán</TableHead>
            <TableHead>Mã đơn hàng</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("status")}
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                Trạng thái
                {getSortIcon("status")}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("createdAt")}
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                Ngày
                {getSortIcon("createdAt")}
              </button>
            </TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!sortedTransactions || sortedTransactions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            sortedTransactions.map((transaction) => (
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleViewDetails(transaction.transactionId)}
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

function TransactionTableSkeleton() {
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
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
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
