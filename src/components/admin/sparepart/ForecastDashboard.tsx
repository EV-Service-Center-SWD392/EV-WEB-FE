"use client";

import React, { useState } from "react";
import { 
  Brain, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Settings,
  RefreshCw,
  Sparkles
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { sparepartForecastService } from "@/services/sparepartForecastService";

import type { 
  SparepartForecastDto,
  SparepartDto 
} from "@/entities/sparepart.types";

interface ForecastDashboardProps {
  forecasts: SparepartForecastDto[];
  spareparts: SparepartDto[];
  onUpdate: () => void;
}

export function ForecastDashboard({ forecasts, spareparts, onUpdate }: ForecastDashboardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState("all");

  const filteredForecasts = selectedCenterId === "all" 
    ? forecasts 
    : forecasts.filter(f => f.centerId === selectedCenterId);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      case "rejected":
        return <Badge variant="destructive">Bị từ chối</Badge>;
      default:
        return <Badge variant="outline">{status || "N/A"}</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Cao</Badge>;
    } else if (confidence >= 0.6) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Trung bình</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Thấp</Badge>;
    }
  };

  const getSparepartName = (sparepartId: string) => {
    const sparepart = spareparts.find(sp => sp.sparepartId === sparepartId);
    return sparepart?.name || `Phụ tùng #${sparepartId.slice(-8)}`;
  };

  const handleGenerateAIForecast = async () => {
    setIsGenerating(true);
    try {
      // In a real app, this would generate forecasts for multiple spareparts
      for (const sparepart of spareparts.slice(0, 3)) {
        await sparepartForecastService.generateAIForecast(
          sparepart.sparepartId,
          "center_1" // Mock center ID
        );
      }
      onUpdate();
    } catch (error) {
      console.error("Error generating forecasts:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveForecast = async (forecastId: string) => {
    try {
      await sparepartForecastService.approveForecast(forecastId, "admin_user");
      onUpdate();
    } catch (error) {
      console.error("Error approving forecast:", error);
    }
  };

  const forecastStats = {
    total: filteredForecasts.length,
    approved: filteredForecasts.filter(f => f.status === "Approved").length,
    pending: filteredForecasts.filter(f => f.status === "Pending").length,
    highConfidence: filteredForecasts.filter(f => (f.forecastConfidence || 0) >= 0.8).length,
    avgConfidence: filteredForecasts.length > 0 
      ? filteredForecasts.reduce((sum, f) => sum + (f.forecastConfidence || 0), 0) / filteredForecasts.length
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Dự báo AI thông minh
          </h2>
          <p className="text-gray-600 mt-1">
            Hệ thống AI dự báo nhu cầu phụ tùng và tối ưu hóa tồn kho
          </p>
        </div>
        
        <Button 
          onClick={handleGenerateAIForecast}
          disabled={isGenerating}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {isGenerating ? "Đang tạo dự báo..." : "Tạo dự báo AI"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng dự báo</p>
                <p className="text-2xl font-bold">{forecastStats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-600">{forecastStats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">{forecastStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Tin cậy cao</p>
                <p className="text-2xl font-bold text-purple-600">{forecastStats.highConfidence}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Độ tin cậy TB</p>
                <p className="text-2xl font-bold">{(forecastStats.avgConfidence * 100).toFixed(0)}%</p>
              </div>
              <div className="w-8">
                <Progress value={forecastStats.avgConfidence * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Brain className="h-5 w-5" />
            Thông tin từ AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Xu hướng tăng</span>
              </div>
              <p className="text-sm text-gray-600">
                Pin lithium và motor BLDC có nhu cầu tăng 25% trong quý tới
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Cảnh báo</span>
              </div>
              <p className="text-sm text-gray-600">
                3 loại phụ tùng có nguy cơ thiếu hàng trong 2 tuần tới
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Tối ưu hóa</span>
              </div>
              <p className="text-sm text-gray-600">
                Có thể tiết kiệm 15% chi phí tồn kho với dự báo AI
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc dự báo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Tất cả trung tâm</option>
              <option value="center_1">Trung tâm Quận 1</option>
              <option value="center_2">Trung tâm Quận 7</option>
              <option value="center_3">Trung tâm Thủ Đức</option>
            </select>
            
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Cài đặt nâng cao
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Forecasts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách dự báo</CardTitle>
          <CardDescription>
            Các dự báo nhu cầu phụ tùng được tạo bởi hệ thống AI
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Phụ tùng</TableHead>
                <TableHead>Dự báo sử dụng</TableHead>
                <TableHead>Tồn kho an toàn</TableHead>
                <TableHead>Điểm đặt hàng</TableHead>
                <TableHead>Độ tin cậy</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForecasts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Brain className="h-12 w-12 text-gray-300" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Chưa có dự báo nào</p>
                        <p className="text-gray-500">Tạo dự báo AI để bắt đầu tối ưu hóa tồn kho</p>
                      </div>
                      <Button 
                        onClick={handleGenerateAIForecast}
                        disabled={isGenerating}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Tạo dự báo đầu tiên
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredForecasts.map((forecast, index) => (
                  <TableRow key={forecast.forecastId}>
                    <TableCell className="font-medium text-gray-900">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {getSparepartName(forecast.sparepartId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {forecast.forecastId.slice(-8)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="font-medium text-blue-600">
                        {forecast.predictedUsage || 0} đơn vị
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-gray-700">
                        {forecast.safetyStock || 0} đơn vị
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-orange-600 font-medium">
                        {forecast.reorderPoint || 0} đơn vị
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(forecast.forecastConfidence || 0) * 100} 
                          className="w-16 h-2" 
                        />
                        <span className="text-sm text-gray-600">
                          {((forecast.forecastConfidence || 0) * 100).toFixed(0)}%
                        </span>
                        {getConfidenceBadge(forecast.forecastConfidence || 0)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(forecast.status || "Pending")}
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-gray-500">
                        {forecast.forecastDate ? 
                          new Date(forecast.forecastDate).toLocaleDateString('vi-VN') : 
                          "N/A"
                        }
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {forecast.status === "Pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveForecast(forecast.forecastId)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}