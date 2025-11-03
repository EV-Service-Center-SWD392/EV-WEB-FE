"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { ShiftType } from "@/entities/userworkschedule.types";
import { Technician } from "@/entities/slot.types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface AssignTechnicianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  technicians: Technician[];
  onAssign: (technicianId: string, date: Date, shift: ShiftType) => void;
  isLoading?: boolean;
}

export default function AssignTechnicianDialog({
  open,
  onOpenChange,
  date,
  technicians,
  onAssign,
  isLoading = false,
}: AssignTechnicianDialogProps) {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<ShiftType>("Morning");

  const handleAssign = () => {
    if (!selectedTechnicianId) return;
    onAssign(selectedTechnicianId, date, selectedShift);
    setSelectedTechnicianId("");
    onOpenChange(false);
  };

  const selectedTechnician = technicians.find((t) => t.id === selectedTechnicianId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Phân công Technician</DialogTitle>
          <DialogDescription>
            Phân công technician làm việc vào ngày {format(date, "d MMMM, yyyy", { locale: vi })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Technician Selection */}
          <div className="space-y-2">
            <Label htmlFor="technician">Technician</Label>
            <Select
              value={selectedTechnicianId}
              onValueChange={setSelectedTechnicianId}
            >
              <SelectTrigger id="technician" className="bg-white">
                <SelectValue placeholder="Chọn technician" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {technicians.map((tech) => {
                  const initials = (tech.name || "T")
                    .split(" ")
                    .map(n => n[0] || "")
                    .join("")
                    .toUpperCase() || "T";
                  const fullName = tech.name || tech.email || "Unknown";
                  
                  return (
                    <SelectItem key={tech.id} value={tech.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 bg-blue-100 text-blue-700">
                          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                        </Avatar>
                        <span>{fullName}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Shift Selection */}
          <div className="space-y-2">
            <Label htmlFor="shift">Ca làm việc</Label>
            <Select
              value={selectedShift}
              onValueChange={(value) => setSelectedShift(value as ShiftType)}
            >
              <SelectTrigger id="shift" className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Morning">
                  Sáng (7:00 - 12:00)
                </SelectItem>
                <SelectItem value="Evening">
                  Chiều (13:00 - 19:00)
                </SelectItem>
                <SelectItem value="Night">
                  Tối (20:00 - 6:00)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedTechnicianId || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang phân công...
              </>
            ) : (
              "Phân công"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
