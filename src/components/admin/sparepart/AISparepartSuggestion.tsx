"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus } from "lucide-react";
import { SparepartForm } from "./SparepartForm";
import type { CreateSparepartDto } from "@/entities/sparepart.types";

interface AIResponse {
  function_results: Array<{
    result: {
      action: string;
      message: string;
      provided_fields: Record<string, { label: string; value: any }>;
      missing_fields: Array<{ field: string; label: string }>;
      note?: string;
    };
  }>;
}

interface AISparepartSuggestionProps {
  aiResponse: AIResponse;
  onSuccess?: () => void;
}

export function AISparepartSuggestion({ aiResponse, onSuccess }: AISparepartSuggestionProps) {
  const [showForm, setShowForm] = useState(false);

  const result = aiResponse.function_results?.[0]?.result;
  
  if (!result || result.action !== "create_sparepart_form") {
    return null;
  }

  const getInitialData = (): Partial<CreateSparepartDto> => {
    const data: Partial<CreateSparepartDto> = {};
    
    Object.entries(result.provided_fields || {}).forEach(([key, field]) => {
      if (key === "vehicleModelId" || key === "unitPrice") {
        (data as any)[key] = Number(field.value) || 0;
      } else {
        (data as any)[key] = field.value;
      }
    });
    
    return data;
  };

  return (
    <>
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-medium text-blue-900">{result.message}</p>
              </div>

              {Object.keys(result.provided_fields).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-2">Thông tin đã có:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.provided_fields).map(([key, field]) => (
                      <Badge key={key} variant="secondary" className="bg-green-100 text-green-800">
                        {field.label}: {field.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.missing_fields.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-orange-800 mb-2">Cần bổ sung:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_fields.map((field) => (
                      <Badge key={field.field} variant="outline" className="text-orange-700 border-orange-300">
                        {field.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo phụ tùng
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SparepartForm
        open={showForm}
        initialData={getInitialData()}
        onSuccess={() => {
          setShowForm(false);
          onSuccess?.();
        }}
        onCancel={() => setShowForm(false)}
      />
    </>
  );
}