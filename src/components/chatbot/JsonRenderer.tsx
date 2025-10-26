import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JsonRendererProps {
  data: any;
}

const JsonRenderer: React.FC<JsonRendererProps> = ({ data }) => {
  if (data === null || data === undefined) return <span className="text-slate-400">No data</span>;

  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return <span className="text-sm">{String(data)}</span>;
  }

  // Special handling for spare parts function
  if (data.function === "get_spare_parts" && data.result?.data) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-slate-600 mb-2">Tìm thấy {data.result.count} phụ tùng:</div>
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
        
        <div className="text-xs text-slate-600 mb-2">Chi tiết dự báo từng phụ tùng:</div>
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
        {data.map((item, index) => (
          <Card key={index} className="text-xs">
            <CardContent className="p-3">
              <JsonRenderer data={item} />
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
              <JsonRenderer data={value} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default JsonRenderer;