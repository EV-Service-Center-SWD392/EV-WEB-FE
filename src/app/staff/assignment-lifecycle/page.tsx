"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assignmentApiService, AssignmentDto } from "@/services/assignmentApiService";
import AssignmentStatusManager from "@/components/staff/assignment/AssignmentStatusManager";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2 } from "lucide-react";

export default function AssignmentLifecyclePage() {
    const [assignments, setAssignments] = React.useState<AssignmentDto[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedStatus, setSelectedStatus] = React.useState<string>("all");

    const loadAssignments = React.useCallback(async (status?: string) => {
        setIsLoading(true);
        try {
            const data = await assignmentApiService.getByRange({
                status: status && status !== "all" ? status : undefined,
            });
            setAssignments(data);
        } catch (error) {
            console.error("Error loading assignments:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadAssignments(selectedStatus);
    }, [selectedStatus, loadAssignments]);

    const groupedAssignments = React.useMemo(() => {
        const groups: Record<string, AssignmentDto[]> = {
            PENDING: [],
            ASSIGNED: [],
            IN_QUEUE: [],
            ACTIVE: [],
            COMPLETED: [],
            CANCELLED: [],
            REASSIGNED: [],
        };

        assignments.forEach((assignment) => {
            if (groups[assignment.status]) {
                groups[assignment.status].push(assignment);
            }
        });

        return groups;
    }, [assignments]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Assignment Lifecycle</h1>
                    <p className="text-muted-foreground">
                        Quản lý vòng đời của technician assignments
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    {assignments.length} assignments
                </Badge>
            </div>

            {/* State Flow Info */}
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Assignment Lifecycle Flow</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm overflow-x-auto pb-2">
                        <Badge>PENDING</Badge>
                        <span>→</span>
                        <Badge variant="default">ASSIGNED</Badge>
                        <span>→</span>
                        <Badge variant="outline">IN_QUEUE</Badge>
                        <span>→</span>
                        <Badge className="bg-green-600">ACTIVE</Badge>
                        <span>→</span>
                        <Badge className="bg-emerald-600">COMPLETED</Badge>
                        <div className="ml-4 text-muted-foreground">
                            (CANCELLED, REASSIGNED có thể xảy ra)
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Assignments by Status */}
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="all">
                        Tất cả ({assignments.length})
                    </TabsTrigger>
                    <TabsTrigger value="PENDING">
                        Pending ({groupedAssignments.PENDING.length})
                    </TabsTrigger>
                    <TabsTrigger value="ASSIGNED">
                        Assigned ({groupedAssignments.ASSIGNED.length})
                    </TabsTrigger>
                    <TabsTrigger value="IN_QUEUE">
                        Queue ({groupedAssignments.IN_QUEUE.length})
                    </TabsTrigger>
                    <TabsTrigger value="ACTIVE">
                        Active ({groupedAssignments.ACTIVE.length})
                    </TabsTrigger>
                    <TabsTrigger value="COMPLETED">
                        Completed ({groupedAssignments.COMPLETED.length})
                    </TabsTrigger>
                    <TabsTrigger value="CANCELLED">
                        Cancelled ({groupedAssignments.CANCELLED.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={selectedStatus} className="space-y-4 mt-6">
                    {assignments.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                Không có assignment nào
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {assignments.map((assignment) => (
                                <Card key={assignment.id}>
                                    <CardHeader>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    #{assignment.id.slice(0, 8)}
                                                </span>
                                                {assignment.queueNo && (
                                                    <Badge variant="outline">
                                                        Queue #{assignment.queueNo}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm space-y-1">
                                                <div>
                                                    <strong>Technician:</strong>{" "}
                                                    {assignment.technicianId.slice(0, 8)}...
                                                </div>
                                                {assignment.bookingId && (
                                                    <div>
                                                        <strong>Booking:</strong>{" "}
                                                        {assignment.bookingId.slice(0, 8)}...
                                                    </div>
                                                )}
                                                <div>
                                                    <strong>Thời gian:</strong>{" "}
                                                    {format(
                                                        new Date(assignment.plannedStartUtc),
                                                        "dd/MM/yyyy HH:mm",
                                                        { locale: vi }
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <AssignmentStatusManager
                                            assignment={assignment}
                                            onStatusChanged={() => loadAssignments(selectedStatus)}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
