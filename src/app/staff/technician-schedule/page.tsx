"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { userService } from "@/services/userService";
import { userWorkScheduleService } from "@/services/userWorkScheduleService";
import { UserRole, type User } from "@/entities/user.types";
import type { UserWorkSchedule } from "@/entities/userworkschedule.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const SHIFTS = [
  { id: "Morning", label: "Ca Sáng", time: "07:00 - 12:00", color: "bg-yellow-50 border-yellow-200" },
  { id: "Evening", label: "Ca Chiều", time: "13:00 - 19:00", color: "bg-blue-50 border-blue-200" },
  { id: "Night", label: "Ca Tối", time: "20:00 - 06:00", color: "bg-purple-50 border-purple-200" },
];

const WEEKDAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

export default function TechnicianSchedulePage() {
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [_userSchedules, setUserSchedules] = useState<UserWorkSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const techsResponse = await userService.getUsers({ role: UserRole.TECHNICIAN });
      setTechnicians(techsResponse);

      const allSchedules = [];
      for (const tech of techsResponse) {
        try {
          const schedules = await userWorkScheduleService.getUserWorkSchedulesByRange(
            tech.id,
            currentWeekStart.toISOString(),
            weekEnd.toISOString()
          );
          allSchedules.push(...schedules);
        } catch (err) {
          console.error(err);
        }
      }

      setUserSchedules(allSchedules);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTechnicians = technicians.filter(
    (tech) =>
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch làm việc Technician</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý lịch làm việc của kỹ thuật viên
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(currentWeekStart);
              newDate.setDate(newDate.getDate() - 7);
              setCurrentWeekStart(newDate);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-[300px] justify-center">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Tuần {currentWeekStart.toLocaleDateString('vi-VN')}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(currentWeekStart);
              newDate.setDate(newDate.getDate() + 7);
              setCurrentWeekStart(newDate);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Technician</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredTechnicians.map((tech) => (
                <div
                  key={tech.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {tech.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{tech.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{tech.email}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="font-semibold text-sm">Ca</div>
                {WEEKDAYS.map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="font-semibold text-sm">{day}</div>
                    <div className="text-xs text-muted-foreground">
                      {weekDates[index].getDate()}/{weekDates[index].getMonth() + 1}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {SHIFTS.map((shift) => (
                  <div key={shift.id} className="grid grid-cols-8 gap-2">
                    <div className={`p-3 rounded-lg border ${shift.color}`}>
                      <p className="font-semibold text-sm">{shift.label}</p>
                      <p className="text-xs">{shift.time}</p>
                    </div>

                    {weekDates.map((date, dayIndex) => (
                      <div
                        key={`${shift.id}-${dayIndex}`}
                        className="min-h-[100px] p-2 border rounded-lg"
                      >
                        {/* Schedule cards will go here */}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
