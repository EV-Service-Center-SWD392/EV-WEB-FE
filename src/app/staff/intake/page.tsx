/**
 * Service Intake List Page
 * View all service intakes and manage EV checklist
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, FileText, CheckCircle, Clock, TrendingUp, BarChart3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { IntakeStatus } from '@/entities/intake.types';
import { IntakeListTable } from '@/components/staff/intake/IntakeListTable';

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
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity", bgColor)} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg", bgColor)}>
          <Icon className={cn("w-4 h-4", color)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">{value}</div>
            {trend && (
              <div className={cn(
                "flex items-center space-x-1 text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                <TrendingUp className={cn("h-3 w-3", trend.isPositive ? "" : "rotate-180")} />
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
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<IntakeStatus | 'all'>('all');

  const stats = [
    {
      title: 'Tổng phiếu tiếp nhận',
      value: '24',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Đang xử lý',
      value: '12',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Đã hoàn thành',
      value: '12',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      trend: { value: 25, isPositive: true },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý phiếu tiếp nhận dịch vụ</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý phiếu tiếp nhận và checklist kiểm tra EV
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Báo cáo
          </Button>
          <Button
            onClick={() => router.push('/staff/schedules')}
            className="shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo phiếu tiếp nhận
          </Button>
        </div>
      </div>

      {/* Animated Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="animate-in fade-in-0 slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Filters and Table */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Danh sách phiếu tiếp nhận</span>
          </CardTitle>
          <CardDescription>
            Xem và quản lý các phiếu tiếp nhận dịch vụ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã booking, tên khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as IntakeStatus | 'all')}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Draft">Đang xử lý</SelectItem>
                <SelectItem value="Completed">Đã hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <IntakeListTable
            searchQuery={searchQuery}
            statusFilter={statusFilter}
          />
        </CardContent>
      </Card>
    </div>
  );
}
