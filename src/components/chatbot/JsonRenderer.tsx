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