import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { replenishmentRequestService } from "@/services/replenishmentRequestService";

interface JsonRendererProps {
  data: any;
  onCardCount?: (count: number) => void;
}

const JsonRenderer: React.FC<JsonRendererProps> = ({ data, onCardCount }) => {
  // Calculate card count for all cases
  const cardCount = React.useMemo(() => {
    if (data?.function === "get_spare_parts" && data.result?.data) {
      return data.result.data.length;
    }
    if (data?.function === "forecast_demand" && data.result?.forecast_result) {
      return (data.result.forecast_result.spare_parts_forecasts?.length || 0) + 1;
    }
    if (Array.isArray(data)) {
      return data.length;
    }
    return 0;
  }, [data]);

  // Call useEffect at top level
  useEffect(() => {
    if (cardCount > 0) {
      onCardCount?.(cardCount);
    }
  }, [cardCount, onCardCount]);

  if (data === null || data === undefined) return <span className="text-slate-400">No data</span>;

  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return <span className="text-sm">{String(data)}</span>;
  }

  // Special handling for spare parts function
  if (data.function === "get_spare_parts" && data.result?.data) {
    
    return (
      <div className="space-y-2">
        <div className="text-xs text-slate-600 mb-2">
          Tìm thấy {data.result.count} phụ tùng:
          {cardCount > 20 && <span className="ml-2 text-orange-600 font-medium">(Đã mở rộng chat)</span>}
        </div>
        {data.result.data.map((item: any, i: number) => (
          <Card key={i} className="mb-2 text-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{item.name || `Phụ tùng ${i + 1}`}</CardTitle>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{item.manufacture}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{item.status}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-medium">Loại:</span> {item.type}</div>
                <div><span className="font-medium">Xe:</span> {item.vehicle_model}</div>
                <div><span className="font-medium">Giá:</span> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(item.price))}</div>
                <div><span className="font-medium">Tồn kho:</span> {item.qty}/{item.min_stock}</div>
              </div>
              {item.qty <= item.min_stock && (
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded mt-2">
                  ⚠️ Sắp hết hàng
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Special handling for forecast demand function
  if (data.function === "forecast_demand" && data.result?.forecast_result) {
    const forecast = data.result.forecast_result;
    
    return (
      <div className="space-y-3">
        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">📊 Dự báo {forecast.forecast_period_months} tháng</CardTitle>
            <div className="text-xs text-slate-600">{forecast.summary?.message}</div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div><span className="font-medium">Phụ tùng phân tích:</span> {forecast.summary?.total_parts_analyzed}</div>
              <div><span className="font-medium">Cần bổ sung:</span> {forecast.summary?.parts_needing_replenishment}</div>
            </div>
            {forecast.summary?.recommendations && (
              <div className="text-xs">
                <div className="font-medium mb-1">Khuyến nghị:</div>
                {forecast.summary.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="text-slate-600">• {rec}</div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-xs text-slate-600 mb-2">
          Chi tiết dự báo từng phụ tùng:
          {cardCount > 20 && <span className="ml-2 text-orange-600 font-medium">(Đã mở rộng chat)</span>}
        </div>
        {forecast.spare_parts_forecasts?.map((part: any, i: number) => (
          <Card key={i} className="mb-2 text-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{part.part_name}</CardTitle>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded ${
                  part.urgency_level === 'high' ? 'bg-red-100 text-red-800' :
                  part.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>{part.urgency_level}</span>
                {part.replenishment_needed && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">Cần bổ sung</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-medium">Tồn kho:</span> {part.current_stock}</div>
                <div><span className="font-medium">Mức tối thiểu:</span> {part.minimum_stock_level}</div>
                <div><span className="font-medium">Tổng dự báo:</span> {part.total_forecast_demand}</div>
                <div><span className="font-medium">Đề xuất đặt:</span> {part.suggested_order_quantity}</div>
              </div>
              {part.monthly_forecasts && (
                <div>
                  <div className="font-medium text-xs mb-1">Dự báo theo tháng:</div>
                  <div className="grid grid-cols-4 gap-1">
                    {part.monthly_forecasts.map((month: any, j: number) => (
                      <div key={j} className="bg-slate-100 p-1 rounded text-center">
                        <div className="text-xs font-medium">T{month.month}</div>
                        <div className="text-xs">{month.predicted_demand}</div>
                        <div className="text-[10px] text-slate-500">{Math.round(month.confidence * 100)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {part.suggested_order_quantity > 0 && (
                <ReplenishmentButton part={part} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Handle arrays
  if (Array.isArray(data)) {
    
    return (
      <div className="space-y-2">
        {cardCount > 20 && (
          <div className="text-xs text-orange-600 font-medium mb-2">(Đã mở rộng chat do có {cardCount} items)</div>
        )}
        {data.map((item, index) => (
          <Card key={index} className="text-xs">
            <CardContent className="p-3">
              <JsonRenderer data={item} onCardCount={onCardCount} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Handle objects
  if (typeof data === "object") {
    return (
      <div className="space-y-2">
        {Object.entries(data).map(([key, value], index) => (
          <div key={index} className="text-xs">
            <div className="font-medium text-slate-700 mb-1">{key}:</div>
            <div className="ml-3 border-l-2 border-slate-200 pl-2">
              <JsonRenderer data={value} onCardCount={onCardCount} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// Replenishment Button Component
const ReplenishmentButton: React.FC<{
  part: any;
}> = ({ part }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCreateRequest = async () => {
    setLoading(true);
    try {
      const requestBody = {
        sparepartId: part.spare_part_id,
        centerId: "22bd45ba-5df7-41d0-88f7-1cb8a73e8376", // Default center from forecast data
        requestedQuantity: part.suggested_order_quantity,
        requestedBy: "AI_FORECAST_SYSTEM",
        supplierId: part.manufacture || "UNKNOWN",
        estimatedCost: parseFloat(part.estimated_cost || "0"),
        priority: part.urgency_level || "medium",
        notes: `Auto-generated from AI forecast for ${part.part_name}. Reasoning: ${part.reasoning || 'N/A'}`,
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: "PENDING"
      };
      
      await replenishmentRequestService.createRequest(requestBody);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to create replenishment request:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
        ✅ Yêu cầu bổ sung đã tạo
      </div>
    );
  }

  return (
    <Button
      onClick={handleCreateRequest}
      disabled={loading}
      size="sm"
      className="w-full text-xs h-7 bg-blue-600 hover:bg-blue-700"
    >
      {loading ? "Đang tạo..." : `Tạo yêu cầu bổ sung (${part.suggested_order_quantity})`}
    </Button>
  );
};

export default JsonRenderer;