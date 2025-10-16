"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  Plus,
  GripVertical,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  UserPlus,
  ArrowUpDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCenters } from "@/hooks/scheduling/useCenters";
import { useQueue } from "@/hooks/scheduling/useQueue";
import { useAssignments } from "@/hooks/scheduling/useAssignments";
import { useTechnicians } from "@/hooks/scheduling/useTechnicians";

type Tab = "schedule" | "queue";

export default function SchedulesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("schedule");
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: centers } = useCenters(); // ✅ Mock data!
  const selectedCenterId = centers?.[0]?.id;

  // Mock queue data cho Queue tab
  const { data: queueTickets } = useQueue({
    centerId: selectedCenterId,
    date: selectedDate,
  });

  // Mock assignments data cho Schedule tab
  const { data: assignments } = useAssignments({
    centerId: selectedCenterId,
    date: selectedDate,
  });

  // Mock technicians data
  const { data: technicians } = useTechnicians(selectedCenterId || '');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Schedules & Queue Management</h1>
        <p className="text-muted-foreground">
          Assign technicians and manage service queue
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <Button
          variant={activeTab === "schedule" ? "default" : "ghost"}
          className="rounded-b-none"
          onClick={() => setActiveTab("schedule")}
        >
          📅 Schedule
        </Button>
        <Button
          variant={activeTab === "queue" ? "default" : "ghost"}
          className="rounded-b-none"
          onClick={() => setActiveTab("queue")}
        >
          📋 Queue
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "schedule" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Technician Assignment</h2>
                  <p className="text-sm text-muted-foreground">
                    Assign technicians to confirmed bookings and service requests
                  </p>
                </div>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  New Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Assignments List */}
              {assignments && assignments.length > 0 ? (
                <div className="space-y-4">
                  {/* Technicians Grid */}
                  {technicians && technicians.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {technicians.map((tech) => {
                        const techAssignments = assignments.filter(
                          (a) => a.technicianId === tech.id
                        );
                        const totalSlots = techAssignments.length;
                        const availableSlots = 5; // Default capacity
                        const isOverloaded = totalSlots > availableSlots;

                        return (
                          <Card
                            key={tech.id}
                            className={`border-2 ${isOverloaded
                                ? 'border-red-300 bg-red-50'
                                : 'border-green-300 bg-green-50'
                              }`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                    {tech.name.charAt(0)}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{tech.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                      {tech.specialties?.join(', ') || 'All Services'}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant={isOverloaded ? "destructive" : "default"}
                                  className="text-xs"
                                >
                                  {totalSlots}/{availableSlots}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {techAssignments.length > 0 ? (
                                <div className="space-y-2">
                                  {techAssignments.map((assignment) => (
                                    <div
                                      key={assignment.id}
                                      className="bg-white rounded-lg p-3 border shadow-sm"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">
                                            {assignment.bookingId ? 'Booking' : 'Service Request'}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {assignment.bookingId || assignment.serviceRequestId}
                                          </p>
                                        </div>
                                        <Badge
                                          variant={
                                            assignment.status === 'Completed' ? 'default' :
                                              assignment.status === 'Started' ? 'secondary' :
                                                'outline'
                                          }
                                          className="text-xs"
                                        >
                                          {assignment.status}
                                        </Badge>
                                      </div>

                                      {assignment.startUtc && assignment.endUtc && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                          <Clock className="w-3 h-3" />
                                          <span>
                                            {new Date(assignment.startUtc).toLocaleTimeString('vi-VN', {
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                          <ChevronRight className="w-3 h-3" />
                                          <span>
                                            {new Date(assignment.endUtc).toLocaleTimeString('vi-VN', {
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                      )}

                                      <div className="flex gap-1 mt-2">
                                        <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                                          <Edit className="w-3 h-3 mr-1" />
                                          Edit
                                        </Button>
                                        <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                                          <Check className="w-3 h-3 mr-1" />
                                          Complete
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-7 px-2">
                                          <Trash2 className="w-3 h-3 text-red-500" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-sm text-muted-foreground">
                                  No assignments today
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-700">
                          {assignments.length}
                        </div>
                        <p className="text-xs text-blue-600">Total Assignments</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-700">
                          {assignments.filter(a => a.status === 'Completed').length}
                        </div>
                        <p className="text-xs text-green-600">Completed</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-700">
                          {assignments.filter(a => a.status === 'Started').length}
                        </div>
                        <p className="text-xs text-yellow-600">In Progress</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-50 border-gray-200">
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-gray-700">
                          {assignments.filter(a => a.status === 'Assigned').length}
                        </div>
                        <p className="text-xs text-gray-600">Assigned</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first technician assignment to get started
                  </p>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Assignment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "queue" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Queue Management</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage walk-in customers with drag & drop prioritization
                  </p>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add to Queue
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Queue List */}
              {queueTickets && queueTickets.length > 0 ? (
                <div className="space-y-4">
                  {/* Queue Items */}
                  <div className="space-y-2">
                    {queueTickets.map((ticket, index) => (
                      <div
                        key={ticket.id}
                        className={`bg-white rounded-lg p-4 border-2 shadow-sm hover:shadow-md transition-shadow ${ticket.status === 'Ready'
                            ? 'border-green-300 bg-green-50'
                            : ticket.status === 'Waiting'
                              ? 'border-yellow-300 bg-yellow-50'
                              : 'border-gray-300'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Drag Handle */}
                          <button className="mt-1 text-gray-400 hover:text-gray-600 cursor-move">
                            <GripVertical className="w-5 h-5" />
                          </button>

                          {/* Queue Number */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                              {ticket.queueNo}
                            </div>
                          </div>

                          {/* Ticket Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  Ticket #{ticket.queueNo}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {ticket.serviceRequestId}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    ticket.status === 'Ready' ? 'default' :
                                      ticket.status === 'Waiting' ? 'secondary' :
                                        'outline'
                                  }
                                >
                                  {ticket.status.toUpperCase()}
                                </Badge>
                                {ticket.priority && (
                                  <Badge variant="outline">
                                    Priority {ticket.priority}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* ETA */}
                            {ticket.estimatedStartUtc && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <Clock className="w-4 h-4" />
                                <span>
                                  ETA: {new Date(ticket.estimatedStartUtc).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" className="gap-1">
                                <ArrowUpDown className="w-3 h-3" />
                                Change Priority
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1">
                                <Clock className="w-3 h-3" />
                                Update ETA
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1">
                                <User className="w-3 h-3" />
                                Assign Tech
                              </Button>
                              {ticket.status === 'Waiting' && (
                                <Button size="sm" variant="default" className="gap-1">
                                  <Check className="w-3 h-3" />
                                  Mark Ready
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700">
                                <X className="w-3 h-3" />
                                No-Show
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Position indicator */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-muted-foreground">
                            Position in queue: {index + 1} of {queueTickets.length}
                            {index > 0 && ` • ${index} customer(s) ahead`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Queue Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-700">
                          {queueTickets.filter(t => t.status === 'Waiting').length}
                        </div>
                        <p className="text-xs text-yellow-600">Waiting</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-700">
                          {queueTickets.filter(t => t.status === 'Ready').length}
                        </div>
                        <p className="text-xs text-green-600">Ready</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-700">
                          {queueTickets.length}
                        </div>
                        <p className="text-xs text-blue-600">Total in Queue</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Help Text */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-semibold mb-1">Queue Management Tips:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Drag tickets to reorder queue priority</li>
                          <li>• Higher priority numbers = served first</li>
                          <li>• Mark customers as &quot;Ready&quot; when technician is available</li>
                          <li>• Use &quot;No-Show&quot; for customers who didn&apos;t arrive</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
                  <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Customers in Queue</h3>
                  <p className="text-muted-foreground mb-4">
                    Add walk-in customers to the service queue
                  </p>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Customer to Queue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
