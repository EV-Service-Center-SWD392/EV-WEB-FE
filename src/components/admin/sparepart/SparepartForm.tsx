"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sparepartService } from "@/services/sparepartService";
import { api } from "@/services/api";
import type { CreateSparepartDto } from "@/entities/sparepart.types";

interface VehicleModel {
  modelid: number;
  name: string;
  brand: string;
}

interface SparepartType {
  typeid: string;
  name: string;
  description?: string;
}

interface SparepartFormProps {
  open: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<CreateSparepartDto>;
}

export function SparepartForm({ open, onSuccess, onCancel, initialData }: SparepartFormProps) {
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [sparepartTypes, setSparepartTypes] = useState<SparepartType[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [displayPrice, setDisplayPrice] = useState<string>("");
  
  const [formData, setFormData] = useState<CreateSparepartDto>({
    vehicleModelId: 3,
    centerName: "EV Service - Thủ Đức", // Fixed center name
    typeName: "",
    name: "",
    description: "",
    manufacturer: "",
    partNumber: "",
    unitPrice: 0,
    ...initialData,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Format number with thousand separators
  const formatPrice = (value: number): string => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Parse formatted price back to number
  const parsePrice = (value: string): number => {
    const numericValue = value.replace(/\./g, "");
    return parseInt(numericValue) || 0;
  };

  // Update display price when formData changes
  useEffect(() => {
    if (formData.unitPrice) {
      setDisplayPrice(formatPrice(formData.unitPrice));
    }
  }, [formData.unitPrice]);

    // Load vehicle models and sparepart types
  useEffect(() => {
    const loadDropdownData = async () => {
      setLoadingData(true);
      try {
        const [vehicleModelsRes, sparepartTypesRes] = await Promise.all([
          api.get<VehicleModel[]>('/api/VehicleModel'),
          api.get<SparepartType[]>('/api/SparepartType')
        ]);
        
        console.log("Vehicle Models:", vehicleModelsRes.data);
        console.log("Sparepart Types:", sparepartTypesRes.data);
        
        const models = vehicleModelsRes.data || [];
        const types = sparepartTypesRes.data || [];
        
        setVehicleModels(models);
        setSparepartTypes(types);
        
        // Set default values if not already set
        if (models.length > 0 && !formData.vehicleModelId) {
          setFormData(prev => ({ ...prev, vehicleModelId: models[0].modelid }));
        }
        if (types.length > 0 && !formData.typeName) {
          setFormData(prev => ({ ...prev, typeName: types[0].name }));
        }
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Không thể tải danh sách dữ liệu");
      } finally {
        setLoadingData(false);
      }
    };

    if (open) {
      loadDropdownData();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await sparepartService.createSparepart(formData);
      toast.success("Tạo phụ tùng thành công");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating sparepart:", error);
      toast.error("Có lỗi xảy ra khi tạo phụ tùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateSparepartDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Thêm phụ tùng mới</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto p-1">
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicleModelId">Vehicle Model ID</Label>
              <Select
                value={formData.vehicleModelId?.toString()}
                onValueChange={(value) => handleChange("vehicleModelId", parseInt(value))}
                disabled={loadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn model xe" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleModels.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-gray-500">
                      {loadingData ? "Đang tải..." : "Không có dữ liệu"}
                    </div>
                  ) : (
                    vehicleModels.map((model) => (
                      <SelectItem key={model.modelid} value={model.modelid.toString()}>
                        {model.brand} - {model.name} (ID: {model.modelid})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="typeName">Loại phụ tùng</Label>
              <Select
                value={formData.typeName || undefined}
                onValueChange={(value) => handleChange("typeName", value)}
                disabled={loadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại phụ tùng" />
                </SelectTrigger>
                <SelectContent>
                  {sparepartTypes.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-gray-500">
                      {loadingData ? "Đang tải..." : "Không có dữ liệu"}
                    </div>
                  ) : (
                    sparepartTypes.map((type) => (
                      <SelectItem key={type.typeid} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Tên phụ tùng</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Má phanh sau"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Má phanh trước chính hãng cho xe điện EV City 2024..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manufacturer">Nhà sản xuất</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleChange("manufacturer", e.target.value)}
                placeholder="EVTech Parts Co., Ltd"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="partNumber">Mã phụ tùng</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => handleChange("partNumber", e.target.value)}
                placeholder="BP-204-FR"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="unitPrice">Giá đơn vị (VND)</Label>
            <Input
              id="unitPrice"
              type="text"
              value={displayPrice}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow numbers and dots
                const numericValue = value.replace(/[^\d]/g, "");
                
                if (numericValue) {
                  const price = parseInt(numericValue);
                  handleChange("unitPrice", price);
                  setDisplayPrice(formatPrice(price));
                } else {
                  handleChange("unitPrice", 0);
                  setDisplayPrice("");
                }
              }}
              placeholder="480.000"
              required
            />
          </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang tạo..." : "Tạo phụ tùng"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}