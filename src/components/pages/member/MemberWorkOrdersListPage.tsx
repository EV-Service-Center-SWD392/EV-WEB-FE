"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkOrders } from "@/hooks/workorders/useWorkOrders";
import { getWorkOrderStatusLabel } from "@/entities/workorder.types";

export default function MemberWorkOrdersListPage() {
  const { data: workOrders, isLoading } = useWorkOrders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Đơn sửa chữa của tôi</h1>
          <p className="text-muted-foreground">
            Theo dõi trạng thái các work order và phê duyệt báo giá.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Work Order</CardTitle>
          <CardDescription>
            Chọn một đơn để xem chi tiết và phê duyệt báo giá.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !workOrders || workOrders.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <FileText className="h-8 w-8" />
              <p>Chưa có work order nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">#{order.id.slice(0, 8)}</p>
                      <Badge variant="outline">{getWorkOrderStatusLabel(order.status)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.vehicleInfo?.brand} {order.vehicleInfo?.model}
                    </p>
                    <p className="text-sm">{order.serviceType}</p>
                    {order.estimatedCost !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        Chi phí dự kiến:{" "}
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                          order.estimatedCost
                        )}
                      </p>
                    )}
                  </div>
                  <Button asChild>
                    <Link href={`/member/workorders/${order.id}`}>Xem chi tiết</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
