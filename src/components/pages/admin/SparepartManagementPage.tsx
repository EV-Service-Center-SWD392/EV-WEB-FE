"use client";

import React, { useState, useEffect } from "react";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw, 
  Brain,
  BarChart3,
  Settings,
  Search
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { SparepartOverview } from "@/components/admin/sparepart/SparepartOverview";
import { SparepartList } from "@/components/admin/sparepart/SparepartList";
import { ForecastDashboard } from "@/components/admin/sparepart/ForecastDashboard";
import { ReplenishmentRequests } from "@/components/admin/sparepart/ReplenishmentRequests";
import { AIInsights } from "@/components/admin/sparepart/AIInsights";

import { sparepartService } from "@/services/sparepartService";
import { sparepartForecastService } from "@/services/sparepartForecastService";
import { sparepartReplenishmentRequestService } from "@/services/sparepartReplenishmentRequestService";

import type { 
  SparepartDto, 
  SparepartStats,
  SparepartForecastDto,
  SparepartReplenishmentRequestDto 
} from "@/entities/sparepart.types";

function SparepartManagementPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<SparepartStats>({
    totalSpareparts: 0,
    totalTypes: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0,
    pendingForecasts: 0,
    pendingReplenishments: 0,
  });
  
  const [spareparts, setSpareparts] = useState<SparepartDto[]>([]);
  const [forecasts, setForecasts] = useState<SparepartForecastDto[]>([]);
  const [replenishmentRequests, setReplenishmentRequests] = useState<SparepartReplenishmentRequestDto[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all data in parallel
      const [
        sparepartsData,
        forecastsData,
        requestsData
      ] = await Promise.all([
        sparepartService.getAllSpareparts().catch(() => []),
        sparepartForecastService.getAllForecasts().catch(() => []),
        sparepartReplenishmentRequestService.getAllRequests().catch(() => [])
      ]);

      // Calculate stats from actual data
      const calculatedStats: SparepartStats = {
        totalSpareparts: sparepartsData.length,
        totalTypes: new Set(sparepartsData.map(sp => sp.typeId).filter(Boolean)).size,
        lowStockCount: sparepartsData.filter(sp => sp.status?.toLowerCase() === 'lowstock').length,
        outOfStockCount: sparepartsData.filter(sp => sp.status?.toLowerCase() === 'outofstock').length,
        totalValue: sparepartsData.reduce((sum, sp) => sum + (sp.unitPrice || 0), 0),
        pendingForecasts: forecastsData.filter(f => f.status === 'Pending').length,
        pendingReplenishments: requestsData.filter(r => r.status === 'Pending').length,
      };

      setSpareparts(sparepartsData);
      setStats(calculatedStats);
      setForecasts(forecastsData);
      setReplenishmentRequests(requestsData);

    } catch (error) {
      console.error("Error loading data:", error);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAllData();
  };

  const getAlertCount = () => {
    return stats.lowStockCount + stats.outOfStockCount + stats.pendingReplenishments;
  };

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Đang tải dữ liệu quản lý phụ tùng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              Quản lý phụ tùng EV
            </h1>
            <p className="text-gray-600 mt-2">
              Theo dõi, dự báo và quản lý phụ tùng xe điện với hỗ trợ AI
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {getAlertCount() > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {getAlertCount()} cảnh báo
              </Badge>
            )}
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng phụ tùng</p>
                <p className="text-2xl font-bold">{stats.totalSpareparts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Loại phụ tùng</p>
                <p className="text-2xl font-bold">{stats.totalTypes}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Tồn kho thấp</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Hết hàng</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Giá trị tổng</p>
                <p className="text-lg font-bold">
                  {new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND',
                    maximumFractionDigits: 0 
                  }).format(stats.totalValue)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Dự báo AI</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendingForecasts}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Yêu cầu bổ sung</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingReplenishments}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:inline-flex">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="spareparts" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Phụ tùng
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Dự báo AI
          </TabsTrigger>
          <TabsTrigger value="replenishment" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Yêu cầu bổ sung
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Phân tích
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <SparepartOverview 
            stats={stats}
            spareparts={spareparts}
            forecasts={forecasts}
            requests={replenishmentRequests}
            onRefresh={loadAllData}
          />
        </TabsContent>

        <TabsContent value="spareparts" className="mt-6">
          <SparepartList 
            spareparts={spareparts}
            onUpdate={loadAllData}
          />
        </TabsContent>

        <TabsContent value="forecast" className="mt-6">
          <ForecastDashboard 
            forecasts={forecasts}
            spareparts={spareparts}
            onUpdate={loadAllData}
          />
        </TabsContent>

        <TabsContent value="replenishment" className="mt-6">
          <ReplenishmentRequests 
            requests={replenishmentRequests}
            spareparts={spareparts}
            onUpdate={loadAllData}
          />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <AIInsights 
            stats={stats}
            spareparts={spareparts}
            forecasts={forecasts}
            requests={replenishmentRequests}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SparepartManagementPage;