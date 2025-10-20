"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  BarChart3,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: string;
  isLoading?: boolean;
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  gradient,
  isLoading = false
}: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity", gradient)} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg bg-gradient-to-br", gradient)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                value
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {trend && !isLoading && (
            <div className={cn(
              "flex items-center space-x-1 text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StaffDashboard() {
  const [stats, setStats] = useState({
    totalTechnicians: 0,
    activeTechnicians: 0,
    pendingTasks: 0,
    completedToday: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real data from API
    setTimeout(() => {
      setStats({
        totalTechnicians: 15,
        activeTechnicians: 12,
        pendingTasks: 8,
        completedToday: 23,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const metrics = [
    {
      title: "Tổng Technicians",
      value: stats.totalTechnicians,
      description: "Kỹ thuật viên trong hệ thống",
      icon: Users,
      trend: { value: 12, isPositive: true },
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Đang hoạt động",
      value: stats.activeTechnicians,
      description: "Technicians đang làm việc",
      icon: UserCheck,
      trend: { value: 8, isPositive: true },
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Nhiệm vụ chờ",
      value: stats.pendingTasks,
      description: "Công việc cần phân công",
      icon: Clock,
      trend: { value: 15, isPositive: false },
      gradient: "from-yellow-500 to-yellow-600",
    },
    {
      title: "Hoàn thành hôm nay",
      value: stats.completedToday,
      description: "Nhiệm vụ đã xong",
      icon: CheckCircle2,
      trend: { value: 25, isPositive: true },
      gradient: "from-emerald-500 to-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Staff</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý Technicians và lịch làm việc
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button size="sm" className="shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            Tạo phiếu tiếp nhận
          </Button>
        </div>
      </div>

      {/* Animated Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={metric.title}
            className="animate-in fade-in-0 slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <MetricCard
              {...metric}
              isLoading={isLoading}
            />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technician Management */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Quản lý Technicians</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start hover:bg-accent/50 transition-colors">
              <Calendar className="h-4 w-4 mr-2" />
              Phân công công việc
            </Button>
            <Button variant="outline" className="w-full justify-start hover:bg-accent/50 transition-colors">
              <Clock className="h-4 w-4 mr-2" />
              Lên lịch làm việc
            </Button>
            <Button variant="outline" className="w-full justify-start hover:bg-accent/50 transition-colors">
              <BarChart3 className="h-4 w-4 mr-2" />
              Theo dõi hiệu suất
            </Button>
          </CardContent>
        </Card>

        {/* Active Technicians */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <span>Technicians đang làm việc</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Nguyễn Văn A</p>
                <p className="text-sm text-muted-foreground">Sửa xe điện Model X</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Đang làm việc
              </Badge>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Trần Thị B</p>
                <p className="text-sm text-muted-foreground">Bảo trì pin Tesla</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Đang làm việc
              </Badge>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Lê Văn C</p>
                <p className="text-sm text-muted-foreground">Chờ phân công</p>
              </div>
              <Badge variant="outline">Chờ việc</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
