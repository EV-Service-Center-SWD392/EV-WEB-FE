"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getReceipts } from "@/services/receiptService";
import { ReceiptDto } from "@/services/receiptService";
import ReceiptTable from "@/components/pages/payment/ReceiptTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, ChevronDown, ChevronUp, Filter } from "lucide-react";

export default function StaffReceiptPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<ReceiptDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Search filters (temporary state while typing)
  const [searchReceiptId, setSearchReceiptId] = useState("");
  const [searchTransactionId, setSearchTransactionId] = useState("");
  const [searchCustomerId, setSearchCustomerId] = useState("");
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  // Applied filters (activated by search button)
  const [appliedReceiptId, setAppliedReceiptId] = useState("");
  const [appliedTransactionId, setAppliedTransactionId] = useState("");
  const [appliedCustomerId, setAppliedCustomerId] = useState("");
  const [appliedCustomerName, setAppliedCustomerName] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  // Fetch all receipts
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setIsLoading(true);
        const data = await getReceipts();
        setReceipts(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  // Filter receipts based on search criteria
  const filteredReceipts = useMemo(() => {
    const filtered = receipts.filter((receipt) => {
      // Receipt ID filter
      if (
        appliedReceiptId &&
        !receipt.receiptId
          ?.toLowerCase()
          .includes(appliedReceiptId.toLowerCase())
      ) {
        return false;
      }

      // Transaction ID filter
      if (
        appliedTransactionId &&
        !receipt.transactionId
          ?.toLowerCase()
          .includes(appliedTransactionId.toLowerCase())
      ) {
        return false;
      }

      // Customer ID filter
      if (
        appliedCustomerId &&
        !receipt.customerId
          ?.toLowerCase()
          .includes(appliedCustomerId.toLowerCase())
      ) {
        return false;
      }

      // Customer Name filter
      if (
        appliedCustomerName &&
        !receipt.customerFullName
          ?.toLowerCase()
          .includes(appliedCustomerName.toLowerCase())
      ) {
        return false;
      }

      // Date range filter
      if (appliedStartDate || appliedEndDate) {
        const receiptDate = receipt.createdAt
          ? new Date(receipt.createdAt)
          : null;
        if (!receiptDate) return false;

        if (appliedStartDate) {
          const startDate = new Date(appliedStartDate);
          startDate.setHours(0, 0, 0, 0);
          if (receiptDate < startDate) return false;
        }

        if (appliedEndDate) {
          const endDate = new Date(appliedEndDate);
          endDate.setHours(23, 59, 59, 999);
          if (receiptDate > endDate) return false;
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
    receipts,
    appliedReceiptId,
    appliedTransactionId,
    appliedCustomerId,
    appliedCustomerName,
    appliedStartDate,
    appliedEndDate,
  ]);

  const handleViewDetails = (receiptId?: string) => {
    if (receiptId) {
      router.push(`/staff/receipt/${receiptId}`);
    }
  };

  const handleSearch = () => {
    setAppliedReceiptId(searchReceiptId);
    setAppliedTransactionId(searchTransactionId);
    setAppliedCustomerId(searchCustomerId);
    setAppliedCustomerName(searchCustomerName);
    setAppliedStartDate(searchStartDate);
    setAppliedEndDate(searchEndDate);
  };

  const handleClearFilters = () => {
    setSearchReceiptId("");
    setSearchTransactionId("");
    setSearchCustomerId("");
    setSearchCustomerName("");
    setSearchStartDate("");
    setSearchEndDate("");
    setAppliedReceiptId("");
    setAppliedTransactionId("");
    setAppliedCustomerId("");
    setAppliedCustomerName("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  const hasActiveFilters =
    appliedReceiptId ||
    appliedTransactionId ||
    appliedCustomerId ||
    appliedCustomerName ||
    appliedStartDate ||
    appliedEndDate;

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Error Loading Receipts
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
          <h2 className="text-2xl font-bold">Hóa Đơn</h2>
          {hasActiveFilters && (
            <span className="text-sm text-muted-foreground bg-primary/10 px-2 py-1 rounded-md">
              {filteredReceipts.length} Bộ lọc
            </span>
          )}
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 mt-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Bộ lọc" : "Hiện bộ lọc"}
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
                  <h3 className="text-lg font-semibold">Search Receipts</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Receipt ID */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Mã hóa đơn
                  </label>
                  <Input
                    placeholder="Search by receipt ID..."
                    value={searchReceiptId}
                    onChange={(e) => setSearchReceiptId(e.target.value)}
                  />
                </div>

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

                {/* Customer ID */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Mã khách hàng
                  </label>
                  <Input
                    placeholder="Search by customer ID..."
                    value={searchCustomerId}
                    onChange={(e) => setSearchCustomerId(e.target.value)}
                  />
                </div>

                {/* Customer Name */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Tên khách hàng
                  </label>
                  <Input
                    placeholder="Search by customer name..."
                    value={searchCustomerName}
                    onChange={(e) => setSearchCustomerName(e.target.value)}
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Ngày bắt đầu
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
                    Ngày kết thúc
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
                Hiện {filteredReceipts.length} trong tổng số {receipts.length} hóa đơn
              </div>

              {/* Search Button */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSearch} className="gap-2 border-2">
                  <Search className="h-4 w-4" />
                  Áp dụng bộ lọc
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Xóa tất cả
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt Table */}
      <ReceiptTable
        receipts={filteredReceipts}
        isLoading={isLoading}
        handleViewDetails={handleViewDetails}
      />
    </div>
  );
}
