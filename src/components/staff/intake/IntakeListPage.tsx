"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, Filter, BarChart3, Plus, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import type { IntakeStatus } from "@/entities/intake.types";
import { IntakeListTable } from "@/components/staff/intake/IntakeListTable";
import { useIntakeList } from "@/hooks/intake";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon: Icon, color, bgColor, trend }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-5 transition-opacity`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${bgColor}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{value}</div>
            {trend && (
              <div
                className={`flex items-center space-x-1 text-xs font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp className={`h-3 w-3 ${trend.isPositive ? "" : "rotate-180"}`} />
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function IntakeListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<IntakeStatus | "all">("all");

  const intakeFilters = React.useMemo(
    () => ({
      status: statusFilter,
      search: searchQuery,
    }),
    [statusFilter, searchQuery],
  );

  const intakeListQuery = useIntakeList(intakeFilters);
  const intakes = React.useMemo(() => intakeListQuery.data ?? [], [intakeListQuery.data]);
  const isLoadingIntakes = intakeListQuery.isLoading;
  const isError = intakeListQuery.isError;
  const error = intakeListQuery.error;

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    const total = intakes.length;
    const inspecting = intakes.filter(i => i.status === 'Inspecting').length;
    const verified = intakes.filter(i => i.status === 'Verified').length;
    const finalized = intakes.filter(i => i.status === 'Finalized').length;

    return [
      {
        title: "Tổng phiếu tiếp nhận",
        value: total.toString(),
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
      },
      {
        title: "Đang kiểm tra",
        value: inspecting.toString(),
        icon: Filter,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      },
      {
        title: "Đã xác nhận",
        value: verified.toString(),
        icon: BarChart3,
        color: "text-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-950/20",
      },
      {
        title: "Đã hoàn tất",
        value: finalized.toString(),
        icon: Plus,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-950/20",
      },
    ];
  }, [intakes]);

  // Show error state
  if (isError) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quản lý phiếu tiếp nhận dịch vụ</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi và chuẩn bị intake trước khi bàn giao checklist cho kỹ thuật viên.
            </p>
          </div>
        </div>

        <EmptyState
          variant="error"
          icon={AlertCircle}
          title="Không thể tải danh sách phiếu tiếp nhận"
          description={error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi tải dữ liệu'}
          action={
            <Button onClick={() => intakeListQuery.refetch()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý phiếu tiếp nhận dịch vụ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi và chuẩn bị intake trước khi bàn giao checklist cho kỹ thuật viên.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/staff/intake/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo intake mới
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Danh sách phiếu tiếp nhận</span>
          </CardTitle>
          <CardDescription>Theo dõi những intake đã tạo và trạng thái xử lý</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã booking, tên khách hàng..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="bg-muted/50 pl-9 focus-visible:ring-1"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as IntakeStatus | "all")}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Checked_In">Checked-In</SelectItem>
                <SelectItem value="Inspecting">Inspecting</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Finalized">Finalized</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <IntakeListTable
            intakes={intakes}
            isLoading={isLoadingIntakes}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
          />
        </CardContent>
      </Card>
    </div>
  );
}
