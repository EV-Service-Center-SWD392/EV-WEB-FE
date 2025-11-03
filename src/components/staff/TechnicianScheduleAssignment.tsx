"use client";

import React, { useState, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTechnicians } from "@/hooks/scheduling/useTechnicians";
import {
  useCreateUserWorkSchedule,
  useDeleteUserWorkSchedule,
} from "@/hooks/scheduling/useUserWorkSchedule";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ShiftType } from "@/entities/userworkschedule.types";
import { Technician } from "@/entities/slot.types";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import TechnicianListItem from "./TechnicianListItem";
import AssignTechnicianDialog from "./AssignTechnicianDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const CENTER_NAME = "EV Service - Thủ Đức";

// No props needed - using fixed center name
type TechnicianScheduleAssignmentProps = Record<string, never>;

// Droppable Day Cell Component
function DroppableDay({
  date,
  shift,
  assignments,
  onRemoveAssignment,
}: {
  date: Date;
  shift: ShiftType;
  assignments: Array<{
    id: string;
    technician: Technician;
    shift: ShiftType;
  }>;
  onRemoveAssignment: (id: string) => void;
}) {
  const slotId = `${format(date, "yyyy-MM-dd")}-${shift}`;
  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
    data: { date, shift },
  });

  const getShiftColor = (shift: ShiftType) => {
    switch (shift) {
      case "Morning":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "Evening":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "Night":
        return "bg-purple-100 text-purple-700 border-purple-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getShiftLabel = (shift: ShiftType) => {
    switch (shift) {
      case "Morning":
        return "Sáng";
      case "Evening":
        return "Chiều";
      case "Night":
        return "Tối";
      default:
        return shift;
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`absolute inset-0 transition-all ${
        isOver ? "bg-blue-100 ring-2 ring-blue-400 ring-inset" : ""
      }`}
    >
      {assignments.length > 0 && (
        <div className="p-1 space-y-1 max-h-full overflow-y-auto">
          {assignments.map((assignment) => {
            const initials = (assignment.technician.name || "T")
              .split(" ")
              .map(n => n[0] || "")
              .join("")
              .toUpperCase() || "T";
            
            return (
              <div
                key={assignment.id}
                className={`group relative p-1.5 rounded border text-xs ${getShiftColor(
                  assignment.shift
                )} shadow-sm hover:shadow-md transition-all`}
              >
                <button
                  onClick={() => onRemoveAssignment(assignment.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="flex items-center gap-1">
                  <Avatar className="h-5 w-5 flex-shrink-0">
                    <AvatarFallback className="text-[8px] font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-[10px]">
                      {assignment.technician.name}
                    </div>
                    <div className="text-[9px] opacity-75">
                      {getShiftLabel(assignment.shift)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TechnicianScheduleAssignment() {
  // DnD sensors - must be at the top
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedShift, setSelectedShift] = useState<ShiftType>("Morning");
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedTechnician, setDraggedTechnician] = useState<Technician | null>(
    null
  );
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Assignments state
  const [assignments, setAssignments] = useState<
    Array<{
      id: string;
      date: Date;
      technician: Technician;
      shift: ShiftType;
    }>
  >([]);

  // Generate week days first
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  }, [currentWeek]);

  // Fetch technicians
  const { data: technicians = [], isLoading: isLoadingTechnicians } =
    useTechnicians();

  // Fetch existing work schedules for the week
  const { data: workSchedules, refetch: refetchSchedules } = useQuery({
    queryKey: ['workSchedules', format(currentWeek, 'yyyy-MM-dd')],
    queryFn: async () => {
      const startDate = format(weekDays[0], 'yyyy-MM-dd');
      const endDate = format(weekDays[6], 'yyyy-MM-dd');
      
      try {
        const response = await api.get('/api/UserWorkSchedule/technicians-schedules', {
          params: { startDate, endDate }
        });
        
        if (response.data && Array.isArray(response.data)) {
          const allSchedules = [];
          
          // Transform the new API response format
          for (const technicianData of response.data) {
            const { userId, userName, email, phoneNumber, schedules } = technicianData;
            
            for (const schedule of schedules || []) {
              // Determine shift based on startTime
              const startTime = new Date(schedule.startTime);
              const hour = startTime.getHours();
              let shift: ShiftType;
              
              if (hour >= 7 && hour < 13) {
                shift = 'Morning';
              } else if (hour >= 13 && hour < 20) {
                shift = 'Evening';
              } else {
                shift = 'Night';
              }
              
              allSchedules.push({
                id: schedule.userWorkScheduleId,
                userId,
                userName,
                email,
                phoneNumber,
                workDate: schedule.startTime,
                shift,
                status: schedule.status,
                centerName: schedule.centerName
              });
            }
          }
          
          return allSchedules;
        }
        
        return [];
      } catch (error) {
        return [];
      }
    },
    enabled: weekDays.length > 0,
    staleTime: 30000, // 30 seconds
  });

  // Transform work schedules to assignments when data changes
  React.useEffect(() => {
    if (workSchedules && technicians.length > 0) {
      const transformedAssignments = workSchedules
        .map((schedule: any) => {
          // Find technician by userId from the schedule data
          const technician = technicians.find(t => t.id === schedule.userId);
          if (technician) {
            return {
              id: schedule.id,
              date: new Date(schedule.workDate),
              technician: {
                ...technician,
                name: schedule.userName // Use userName from API response
              },
              shift: schedule.shift as ShiftType
            };
          }
          return null;
        })
        .filter((assignment): assignment is {
          id: string;
          date: Date;
          technician: Technician;
          shift: ShiftType;
        } => assignment !== null);
      
      setAssignments(transformedAssignments);
    }
  }, [workSchedules, technicians]);

  // Generate time slots
  const timeSlots = useMemo(() => {
    return [
      {
        shift: 'Morning' as ShiftType,
        label: 'Ca Sáng',
        time: '07:00 - 12:00',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700'
      },
      {
        shift: 'Evening' as ShiftType,
        label: 'Ca Chiều', 
        time: '13:00 - 19:00',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700'
      },
      {
        shift: 'Night' as ShiftType,
        label: 'Ca Tối',
        time: '20:00 - 06:00',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700'
      }
    ];
  }, []);



  // Filter technicians
  const filteredTechnicians = useMemo(() => {
    if (!searchTerm) return technicians;
    const lower = searchTerm.toLowerCase();
    return technicians.filter(
      (tech) =>
        tech.name.toLowerCase().includes(lower) ||
        (tech.email || "").toLowerCase().includes(lower)
    );
  }, [technicians, searchTerm]);

  // Mutations
  const createScheduleMutation = useCreateUserWorkSchedule();
  const deleteScheduleMutation = useDeleteUserWorkSchedule();

  // Handle drag start
  const handleDragStart = (event: any) => {
    const technicianId = event.active.id as string;
    const technician = technicians.find((t) => t.id === technicianId);
    setDraggedTechnician(technician || null);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setDraggedTechnician(null);
      return;
    }

    const technicianId = active.id as string;
    const technician = technicians.find((t) => t.id === technicianId);
    const slotId = over.id as string;

    // Parse slot ID: "YYYY-MM-DD-ShiftType"
    const parts = slotId.split('-');
    const dateStr = parts.slice(0, 3).join('-'); // YYYY-MM-DD
    const shiftType = parts[3] as ShiftType; // ShiftType

    if (technician && dateStr && shiftType) {
      const date = new Date(dateStr);
      
      // Check if technician is already assigned to this shift on this date
      const existingAssignment = assignments.find(a => 
        a.technician.id === technician.id && 
        format(a.date, 'yyyy-MM-dd') === dateStr && 
        a.shift === shiftType
      );

      if (existingAssignment) {
        setDraggedTechnician(null);
        return; // Prevent duplicate assignment
      }
      
      // Create assignment
      const newAssignment = {
        id: `${technicianId}-${dateStr}-${shiftType}-${Date.now()}`,
        date,
        technician,
        shift: shiftType,
      };
      
      // Add to UI immediately
      setAssignments((prev) => [...prev, newAssignment]);

      // Call API to create schedule
      createScheduleMutation.mutate({
        userId: technician.id,
        centerName: CENTER_NAME,
        shift: shiftType,
        workDate: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      }, {
        onSuccess: () => {
          // Refetch to get updated data from server
          refetchSchedules();
        },
        onError: () => {
          // Remove from UI if API call fails
          setAssignments((prev) => prev.filter(a => a.id !== newAssignment.id));
        }
      });
    }

    setDraggedTechnician(null);
  };

  // Handle remove assignment
  const handleRemoveAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    // In real app, call deleteScheduleMutation here
  };

  // Get assignments for a specific date
  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter((a) => isSameDay(a.date, date));
  };

  // Handle week navigation
  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => addDays(prev, 7));
  };

  // Refetch schedules when week changes
  React.useEffect(() => {
    if (technicians.length > 0 && weekDays.length > 0) {
      refetchSchedules();
    }
  }, [currentWeek, refetchSchedules, technicians.length, weekDays.length]);

  // Handle time slot click for dialog
  const handleTimeSlotClick = (date: Date, shift: ShiftType) => {
    setSelectedDate(date);
    setSelectedShift(shift);
    setAssignDialogOpen(true);
  };

  // Handle assign from dialog
  const handleAssignFromDialog = async (
    technicianId: string,
    date: Date,
    shift: ShiftType
  ) => {
    const technician = technicians.find((t) => t.id === technicianId);
    if (technician) {
      // Check for duplicate assignment
      const existingAssignment = assignments.find(a => 
        a.technician.id === technician.id && 
        format(a.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && 
        a.shift === shift
      );

      if (existingAssignment) {
        return; // Prevent duplicate assignment
      }

      const newAssignment = {
        id: `${technicianId}-${format(date, "yyyy-MM-dd")}-${shift}-${Date.now()}`,
        date,
        technician,
        shift,
      };
      
      // Add to UI immediately
      setAssignments((prev) => [...prev, newAssignment]);

      try {
        await createScheduleMutation.mutateAsync({
          userId: technician.id,
          centerName: CENTER_NAME,
          shift,
          workDate: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
        });
      } catch (error) {
        // Remove from UI if API call fails
        setAssignments((prev) => prev.filter(a => a.id !== newAssignment.id));
      }
    }
  };

  // Custom day content with assignments
  const DayContent = ({ date, shift }: { date: Date; shift: ShiftType }) => {
    const dayAssignments = getAssignmentsForDate(date).filter(a => a.shift === shift);
    return (
      <div className="relative h-full w-full">
        <DroppableDay
          date={date}
          shift={shift}
          assignments={dayAssignments}
          onRemoveAssignment={handleRemoveAssignment}
        />
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Lịch làm việc Technician
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Kéo technician vào lịch • Nhấp vào ngày để phân công
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-gray-700 px-3 py-1 bg-gray-100 rounded-lg min-w-[200px] text-center">
                {weekDays.length > 0 ? `${format(weekDays[0], "d MMM", { locale: vi })} - ${format(weekDays[6], "d MMM yyyy", { locale: vi })}` : 'Loading...'}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full flex">
            {/* Left Sidebar - Technician List */}
            <div className="flex-shrink-0 w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
              {/* Sidebar Header */}
              <div className="p-4 bg-white border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  Danh sách Technician
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Kéo thả để phân công lịch
                </p>
              </div>

              {/* Search and Filters */}
              <div className="p-4 space-y-3 border-b border-gray-200 bg-white">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm technician..."
                    className="pl-8 bg-white border-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="shift"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ca làm việc mặc định
                  </Label>
                  <Select
                    value={selectedShift}
                    onValueChange={(value) =>
                      setSelectedShift(value as ShiftType)
                    }
                  >
                    <SelectTrigger id="shift" className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Morning">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span>Sáng (7:00 - 12:00)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Evening">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>Chiều (13:00 - 19:00)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Night">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-500" />
                          <span>Tối (20:00 - 6:00)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Technician List */}
              <div className="flex-1 overflow-y-auto p-4 bg-white">
                <div className="space-y-2">
                  {isLoadingTechnicians ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : filteredTechnicians.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-sm">
                        Không tìm thấy technician
                      </p>
                    </div>
                  ) : (
                    filteredTechnicians.map((technician, index) => (
                      <TechnicianListItem 
                        key={technician.id || `technician-${index}`} 
                        technician={technician} 
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                  {filteredTechnicians.length} technician có sẵn
                </div>
              </div>
            </div>

            {/* Right Side - Time Slot Grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 bg-gray-50 p-6">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
                  {/* Header with days */}
                  <div className="grid grid-cols-8 border-b border-gray-200">
                    <div className="p-3 bg-gray-50 border-r border-gray-200 text-xs font-medium text-gray-500">
                      Giờ
                    </div>
                    {weekDays.map((day) => (
                      <div key={format(day, "yyyy-MM-dd")} className="p-3 bg-gray-50 border-r border-gray-200 text-center">
                        <div className="text-xs font-medium text-gray-500">
                          {format(day, "EEE", { locale: vi })}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {format(day, "d/M")}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Shift slots grid */}
                  <div className="flex-1 flex flex-col">
                    {timeSlots.map((slot, index) => (
                      <div key={slot.shift} className={`grid grid-cols-8 border-b border-gray-100 flex-1 ${index === timeSlots.length - 1 ? 'border-b-0' : ''}`}>
                        <div className={`p-4 border-r border-gray-200 ${slot.bgColor} ${slot.borderColor} flex flex-col justify-center`}>
                          <div className={`text-sm font-semibold ${slot.textColor}`}>
                            {slot.label}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {slot.time}
                          </div>
                        </div>
                        {weekDays.map((day) => {
                          const slotId = `${format(day, "yyyy-MM-dd")}-${slot.shift}`;
                          const dayAssignments = getAssignmentsForDate(day).filter(a => a.shift === slot.shift);
                          
                          return (
                            <div
                              key={slotId}
                              className={`border-r border-gray-200 relative cursor-pointer hover:${slot.bgColor} transition-colors h-full min-h-[120px]`}
                              onClick={() => handleTimeSlotClick(day, slot.shift)}
                            >
                              <DroppableDay
                                date={day}
                                shift={slot.shift}
                                assignments={dayAssignments}
                                onRemoveAssignment={handleRemoveAssignment}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assign Dialog */}
        {selectedDate && (
          <AssignTechnicianDialog
            open={assignDialogOpen}
            onOpenChange={setAssignDialogOpen}
            date={selectedDate}
            technicians={filteredTechnicians}
            onAssign={handleAssignFromDialog}
            isLoading={createScheduleMutation.isPending}
          />
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedTechnician && (
            <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-2xl opacity-90">
              <TechnicianListItem technician={draggedTechnician} />
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
