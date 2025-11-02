"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getTransactions } from "@/services/transactionService";
import { TransactionDto } from "@/services/transactionService";
import TransactionTable from "@/components/pages/payment/TransactionTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, ChevronDown, ChevronUp, Filter } from "lucide-react";

export default function StaffTransactionPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Search filters (temporary state while typing)
  const [searchTransactionId, setSearchTransactionId] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchStaffId, setSearchStaffId] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  // Applied filters (activated by search button)
  const [appliedTransactionId, setAppliedTransactionId] = useState("");
  const [appliedOrderId, setAppliedOrderId] = useState("");
  const [appliedStaffId, setAppliedStaffId] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [appliedDescription, setAppliedDescription] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  // Fetch all transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await getTransactions();
        setTransactions(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions based on search criteria
  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      // Transaction ID filter
      if (
        appliedTransactionId &&
        !transaction.transactionId
          ?.toLowerCase()
          .includes(appliedTransactionId.toLowerCase())
      ) {
        return false;
      }

      // Order ID filter
      if (
        appliedOrderId &&
        !transaction.orderId
          ?.toLowerCase()
          .includes(appliedOrderId.toLowerCase())
      ) {
        return false;
      }

      // Staff ID filter
      if (
        appliedStaffId &&
        !transaction.staffId
          ?.toLowerCase()
          .includes(appliedStaffId.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (
        appliedStatus &&
        !transaction.status?.toLowerCase().includes(appliedStatus.toLowerCase())
      ) {
        return false;
      }

      // Description filter
      if (
        appliedDescription &&
        !transaction.description
          ?.toLowerCase()
          .includes(appliedDescription.toLowerCase())
      ) {
        return false;
      }

      // Date range filter
      if (appliedStartDate || appliedEndDate) {
        const transactionDate = transaction.createdAt
          ? new Date(transaction.createdAt)
          : null;
        if (!transactionDate) return false;

        if (appliedStartDate) {
          const startDate = new Date(appliedStartDate);
          startDate.setHours(0, 0, 0, 0);
          if (transactionDate < startDate) return false;
        }

        if (appliedEndDate) {
          const endDate = new Date(appliedEndDate);
          endDate.setHours(23, 59, 59, 999);
          if (transactionDate > endDate) return false;
        }
      }

      return true;
    });

    // Sort by date (newest first) by default
    return filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
    });
  }, [
    transactions,
    appliedTransactionId,
    appliedOrderId,
    appliedStaffId,
    appliedStatus,
    appliedDescription,
    appliedStartDate,
    appliedEndDate,
  ]);

  const handleViewDetails = (transactionId?: string) => {
    if (transactionId) {
      router.push(`/staff/payment/${transactionId}`);
    }
  };

  const handleSearch = () => {
    setAppliedTransactionId(searchTransactionId);
    setAppliedOrderId(searchOrderId);
    setAppliedStaffId(searchStaffId);
    setAppliedStatus(searchStatus);
    setAppliedDescription(searchDescription);
    setAppliedStartDate(searchStartDate);
    setAppliedEndDate(searchEndDate);
  };

  const handleClearFilters = () => {
    setSearchTransactionId("");
    setSearchOrderId("");
    setSearchStaffId("");
    setSearchStatus("");
    setSearchDescription("");
    setSearchStartDate("");
    setSearchEndDate("");
    setAppliedTransactionId("");
    setAppliedOrderId("");
    setAppliedStaffId("");
    setAppliedStatus("");
    setAppliedDescription("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  const hasActiveFilters =
    appliedTransactionId ||
    appliedOrderId ||
    appliedStaffId ||
    appliedStatus ||
    appliedDescription ||
    appliedStartDate ||
    appliedEndDate;

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Error Loading Transactions
          </h2>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Giao Dịch</h2>
          {hasActiveFilters && (
            <span className="text-sm text-muted-foreground bg-primary/10 px-2 py-1 rounded-md">
              {filteredTransactions.length} Bộ Lọc
            </span>
          )}
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          {showFilters ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Filters - Collapsible */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Tìm Giao Dịch</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Transaction ID */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Mã giao dịch
                  </label>
                  <Input
                    placeholder="Search by transaction ID..."
                    value={searchTransactionId}
                    onChange={(e) => setSearchTransactionId(e.target.value)}
                  />
                </div>

                {/* Order ID */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Mã đơn hàng
                  </label>
                  <Input
                    placeholder="Search by order ID..."
                    value={searchOrderId}
                    onChange={(e) => setSearchOrderId(e.target.value)}
                  />
                </div>

                {/* Staff ID */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Mã nhân viên
                  </label>
                  <Input
                    placeholder="Search by staff ID..."
                    value={searchStaffId}
                    onChange={(e) => setSearchStaffId(e.target.value)}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Trạng thái
                  </label>
                  <Input
                    placeholder="Search by status..."
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Mô tả
                  </label>
                  <Input
                    placeholder="Search by description..."
                    value={searchDescription}
                    onChange={(e) => setSearchDescription(e.target.value)}
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Từ ngày
                  </label>
                  <Input
                    type="date"
                    value={searchStartDate}
                    onChange={(e) => setSearchStartDate(e.target.value)}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Đến ngày
                  </label>
                  <Input
                    type="date"
                    value={searchEndDate}
                    onChange={(e) => setSearchEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground pt-2">
                Hiển thị {filteredTransactions.length} trong số {transactions.length}{" "}
                giao dịch
              </div>

              {/* Search Button */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSearch} className="gap-2">
                  <Search className="h-4 w-4" />
                  Áp Dụng Bộ Lọc
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Xóa Tất Cả
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Table */}
      <TransactionTable
        transactions={filteredTransactions}
        isLoading={isLoading}
        handleViewDetails={handleViewDetails}
      />
    </div>
  );
}
