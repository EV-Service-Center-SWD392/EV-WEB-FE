"use client";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { components } from "@/services/schema";

type ReceiptDto = components["schemas"]["ReceiptDto"];
// type ReceiptItemDto = components["schemas"]["ReceiptItemDto"];
// Mock data - replace with actual API call
const MOCK_RECEIPTS: ReceiptDto[] = [
  {
    receiptId: "RCP001",
    totalAmount: 150.99,
    customerId: "CUST001",
    transactionId: "TXN001",
    createdAt: new Date().toISOString(),
    items: [
      {
        receiptItemId: "RCPI001",
        itemId: "ITEM001",
        itemName: "Product A",
        itemType: "product",
        quantity: 1,
        unitPrice: 75.99,
        lineTotal: 75.99,
      },
      {
        receiptItemId: "RCPI002",
        itemId: "ITEM002",
        itemName: "Product B",
        itemType: "product",
        quantity: 1,
        unitPrice: 75.0,
        lineTotal: 75.0,
      },
    ],
  },
  {
    receiptId: "RCP002",
    totalAmount: 29.99,
    customerId: "CUST001",
    transactionId: "TXN002",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Hôm qua
    items: [
      {
        receiptItemId: "RCPI003",
        itemId: "ITEM003",
        itemName: "Subscription - Monthly",
        itemType: "subscription",
        quantity: 1,
        unitPrice: 29.99,
        lineTotal: 29.99,
      },
    ],
  },
  {
    receiptId: "RCP003",
    totalAmount: 200.5,
    customerId: "CUST002",
    transactionId: "TXN004",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 ngày trước
    items: [
      {
        receiptItemId: "RCPI004",
        itemId: "ITEM004",
        itemName: "Service Fee",
        itemType: "service",
        quantity: 1,
        unitPrice: 200.5,
        lineTotal: 200.5,
      },
    ],
  },
];

export default function ReceiptHistoryTable() {
  const router = useRouter();

  const handleViewDetails = (receiptId?: string) => {
    if (receiptId) {
      router.push(`/receipt/${receiptId}`);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Receipt ID</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Customer ID</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_RECEIPTS.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No receipts found
              </TableCell>
            </TableRow>
          ) : (
            MOCK_RECEIPTS.map((receipt) => (
              <TableRow key={receipt.receiptId} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {receipt.receiptId}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(receipt.totalAmount || 0)}
                </TableCell>
                <TableCell>{receipt.customerId}</TableCell>
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
