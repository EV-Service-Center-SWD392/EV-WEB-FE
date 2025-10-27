"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sparepartService } from "@/services/sparepartService";
import type { CreateSparepartDto } from "@/entities/sparepart.types";

interface SparepartFormProps {
  open: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SparepartForm({ open, onSuccess, onCancel }: SparepartFormProps) {
  const [formData, setFormData] = useState<CreateSparepartDto>({
    vehicleModelId: 3,
    centerName: "",
    typeName: "",
    name: "",
    description: "",
    manufacturer: "",
    partNumber: "",
    unitPrice: 0,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await sparepartService.createSparepart(formData);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating sparepart:", error);
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
              <Input
                id="vehicleModelId"
                type="number"
                value={formData.vehicleModelId || ""}
                onChange={(e) => handleChange("vehicleModelId", parseInt(e.target.value) || 0)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="centerName">Tên trung tâm</Label>
              <Input
                id="centerName"
                value={formData.centerName}
                onChange={(e) => handleChange("centerName", e.target.value)}
                placeholder="EV Service - Thủ Đức"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="typeName">Loại phụ tùng</Label>
              <Input
                id="typeName"
                value={formData.typeName}
                onChange={(e) => handleChange("typeName", e.target.value)}
                placeholder="Hệ thống phanh"
                required
              />
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
              type="number"
              value={formData.unitPrice || ""}
              onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value) || 0)}
              placeholder="480000"
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