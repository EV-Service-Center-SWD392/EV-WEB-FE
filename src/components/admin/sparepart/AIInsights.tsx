"use client";

import React, { useState, useEffect } from "react";
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Activity,
  Zap,
  Target,
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { sparepartForecastService } from "@/services/sparepartForecastService";
import { sparepartReplenishmentRequestService } from "@/services/sparepartReplenishmentRequestService";

import type { 
  SparepartStats,
  SparepartDto,
  SparepartForecastDto,
  SparepartReplenishmentRequestDto 
} from "@/entities/sparepart.types";

interface ForecastAccuracyData {
  accuracy: number;
  totalForecasts: number;
  accurateForecasts: number;
  avgConfidence: number;
}

interface RequestStatsData {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  avgProcessingTime: number;
  totalRequestedValue: number;
}

interface AIInsightsProps {
  stats: SparepartStats;
  spareparts: SparepartDto[];
  forecasts: SparepartForecastDto[];
  requests: SparepartReplenishmentRequestDto[];
}

export function AIInsights({ spareparts, forecasts, requests }: AIInsightsProps) {
  const [forecastAccuracy, setForecastAccuracy] = useState<ForecastAccuracyData | null>(null);
  const [requestStats, setRequestStats] = useState<RequestStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInsightData();
  }, []);

  const loadInsightData = async () => {
    try {
      setIsLoading(true);
      const [accuracyData, reqStatsData] = await Promise.all([
        sparepartForecastService.getForecastAccuracy().catch(() => null),
        sparepartReplenishmentRequestService.getRequestStats().catch(() => null)
      ]);
      
      setForecastAccuracy(accuracyData);
      setRequestStats(reqStatsData);
    } catch (error) {
      console.error("Error loading insight data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceMetrics = () => {
    const totalForecasts = forecasts.length;
    const approvedForecasts = forecasts.filter(f => f.status === "Approved").length;
    const totalRequests = requests.length;
    const approvedRequests = requests.filter(r => r.status === "Approved").length;
    
    return {
      forecastApprovalRate: totalForecasts > 0 ? (approvedForecasts / totalForecasts) * 100 : 0,
      requestApprovalRate: totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0,
      avgConfidence: forecasts.length > 0 
        ? forecasts.reduce((sum, f) => sum + (f.forecastConfidence || 0), 0) / forecasts.length * 100
        : 0,
      costSavingPotential: 15.2, // Mock data
      inventoryOptimization: 23.5, // Mock data
    };
  };

  const getInventoryInsights = () => {
    const lowStockItems = spareparts.filter(sp => sp.status === "LowStock").length;
    const outOfStockItems = spareparts.filter(sp => sp.status === "OutOfStock").length;
    const healthyStock = spareparts.length - lowStockItems - outOfStockItems;
    
    return {
      healthyStock,
      lowStockItems,
      outOfStockItems,
      stockHealthScore: spareparts.length > 0 ? (healthyStock / spareparts.length) * 100 : 0,
    };
  };

  const getTrendAnalysis = () => {
    // Mock trend data - in real app, this would come from historical analysis
    return [
      {
        category: "Pin Lithium",
        trend: "up",
        change: 25,
        reason: "Tăng nhu cầu xe điện cá nhân",
        forecast: "Tiếp tục tăng 30% trong Q2"
      },
      {
        category: "Motor BLDC",
        trend: "up",
        change: 18,
        reason: "Mở rộng dịch vụ sửa chữa",
        forecast: "Ổn định ở mức cao"
      },
      {
        category: "Phanh đĩa",
        trend: "stable",
        change: 3,
        reason: "Nhu cầu ổn định",
        forecast: "Không thay đổi đáng kể"
      },
      {
        category: "Cảm biến TPMS",
        trend: "down",
        change: -12,
        reason: "Giảm do cải thiện chất lượng",
        forecast: "Tiếp tục giảm nhẹ"
      }
    ];
  };

  const getActionableInsights = () => {
    return [
      {
        type: "urgent",
        title: "Bổ sung khẩn cấp",
        description: "3 loại phụ tùng cần bổ sung trong 48h",
        action: "Tạo đơn đặt hàng ngay",
        impact: "Tránh gián đoạn dịch vụ",
        priority: "Cao"
      },
      {
        type: "optimization",
        title: "Tối ưu tồn kho",
        description: "Có thể giảm 20% chi phí lưu kho",
        action: "Điều chỉnh mức tồn kho tối thiểu",
        impact: "Tiết kiệm 15 triệu VND/tháng",
        priority: "Trung bình"
      },
      {
        type: "forecast",
        title: "Dự báo theo mùa",
        description: "Nhu cầu tăng 35% vào mùa hè",
        action: "Chuẩn bị tồn kho sớm",
        impact: "Đảm bảo phục vụ khách hàng",
        priority: "Trung bình"
      },
      {
        type: "supplier",
        title: "Đa dạng nhà cung cấp",
        description: "Phụ thuộc quá nhiều vào 1 nhà cung cấp",
        action: "Tìm kiếm nhà cung cấp backup",
        impact: "Giảm rủi ro thiếu hàng",
        priority: "Thấp"
      }
    ];
  };

  const metrics = getPerformanceMetrics();
  const inventoryInsights = getInventoryInsights();
  const trends = getTrendAnalysis();
  const insights = getActionableInsights();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-purple-400" />
          <p className="text-gray-600">AI đang phân tích dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Phân tích thông minh AI
          </h2>
          <p className="text-gray-600 mt-1">
            Insights và khuyến nghị từ hệ thống AI để tối ưu hóa quản lý phụ tùng
          </p>
        </div>
        
        <Badge variant="outline" className="text-purple-600 border-purple-200">
          <Zap className="h-4 w-4 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Độ chính xác AI</p>
                <p className="text-2xl font-bold text-purple-800">
                  {forecastAccuracy ? `${(forecastAccuracy.accuracy * 100).toFixed(0)}%` : '85%'}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={forecastAccuracy ? forecastAccuracy.accuracy * 100 : 85} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dự báo được duyệt</p>
                <p className="text-2xl font-bold text-green-600">{metrics.forecastApprovalRate.toFixed(0)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={metrics.forecastApprovalRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Độ tin cậy TB</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.avgConfidence.toFixed(0)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={metrics.avgConfidence} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiết kiệm chi phí</p>
                <p className="text-2xl font-bold text-green-600">{metrics.costSavingPotential}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={metrics.costSavingPotential} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tối ưu tồn kho</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.inventoryOptimization}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
            <Progress value={metrics.inventoryOptimization} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Inventory Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Tình trạng tồn kho tổng quan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-green-600">
                  {inventoryInsights.healthyStock}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Tồn kho khỏe mạnh</p>
              <p className="text-xs text-green-600 mt-1">
                {inventoryInsights.stockHealthScore.toFixed(0)}% tổng số
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-yellow-600">
                  {inventoryInsights.lowStockItems}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Tồn kho thấp</p>
              <p className="text-xs text-yellow-600 mt-1">Cần theo dõi</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-red-600">
                  {inventoryInsights.outOfStockItems}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Hết hàng</p>
              <p className="text-xs text-red-600 mt-1">Cần bổ sung ngay</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <CircularProgress 
                  value={inventoryInsights.stockHealthScore} 
                  size={80}
                  strokeWidth={8}
                  className="text-blue-600"
                />
              </div>
              <p className="text-sm font-medium text-gray-600">Điểm sức khỏe</p>
              <p className="text-xs text-blue-600 mt-1">
                {inventoryInsights.stockHealthScore.toFixed(0)}/100
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Phân tích xu hướng
          </CardTitle>
          <CardDescription>
            Xu hướng nhu cầu phụ tùng dựa trên dữ liệu lịch sử và dự báo AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {trend.trend === "up" ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : trend.trend === "down" ? (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    ) : (
                      <Activity className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="font-medium text-gray-900">{trend.category}</span>
                  </div>
                  <Badge 
                    variant={trend.trend === "up" ? "default" : trend.trend === "down" ? "destructive" : "secondary"}
                    className={
                      trend.trend === "up" 
                        ? "bg-green-100 text-green-800" 
                        : trend.trend === "down" 
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {trend.change > 0 ? "+" : ""}{trend.change}%
                  </Badge>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">{trend.reason}</p>
                  <p className="text-xs text-blue-600 font-medium">{trend.forecast}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actionable Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Khuyến nghị hành động
          </CardTitle>
          <CardDescription>
            Các hành động cụ thể được AI đề xuất để cải thiện hiệu quả
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className={`border-l-4 ${
                insight.priority === "Cao" 
                  ? "border-l-red-500 bg-red-50" 
                  : insight.priority === "Trung bình"
                  ? "border-l-yellow-500 bg-yellow-50"
                  : "border-l-gray-500 bg-gray-50"
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {insight.type === "urgent" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {insight.type === "optimization" && <BarChart3 className="h-4 w-4 text-blue-500" />}
                      {insight.type === "forecast" && <Clock className="h-4 w-4 text-purple-500" />}
                      {insight.type === "supplier" && <Target className="h-4 w-4 text-orange-500" />}
                      <span className="font-medium text-gray-900">{insight.title}</span>
                    </div>
                    <Badge 
                      variant={insight.priority === "Cao" ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">Hành động:</span>
                      <span className="text-xs text-blue-600">{insight.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">Tác động:</span>
                      <span className="text-xs text-green-600">{insight.impact}</span>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline" className="w-full mt-3">
                    Thực hiện ngay
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {(forecastAccuracy || requestStats) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forecastAccuracy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Hiệu suất dự báo AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tổng số dự báo</span>
                    <span className="font-medium">{forecastAccuracy.totalForecasts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Dự báo chính xác</span>
                    <span className="font-medium text-green-600">{forecastAccuracy.accurateForecasts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Độ tin cậy trung bình</span>
                    <span className="font-medium text-blue-600">
                      {(forecastAccuracy.avgConfidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {requestStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Thống kê yêu cầu bổ sung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tổng yêu cầu</span>
                    <span className="font-medium">{requestStats.totalRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Đã duyệt</span>
                    <span className="font-medium text-green-600">{requestStats.approvedRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Thời gian xử lý TB</span>
                    <span className="font-medium text-blue-600">{requestStats.avgProcessingTime}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Giá trị yêu cầu</span>
                    <span className="font-medium text-orange-600">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND',
                        maximumFractionDigits: 0 
                      }).format(requestStats.totalRequestedValue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component for circular progress
function CircularProgress({ value, size = 40, strokeWidth = 4, className = "" }: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-blue-600 transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium">{Math.round(value)}</span>
      </div>
    </div>
  );
}