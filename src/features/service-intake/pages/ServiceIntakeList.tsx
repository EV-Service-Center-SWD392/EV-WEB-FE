/**
 * ServiceIntakeList Page
 * Displays all service intakes with filtering and actions
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Search,
    Plus,
    Filter,
    RefreshCw,
    Eye,
    Calendar,
    Loader2,
    ClipboardCheck,
    AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import type { ServiceIntake, IntakeStatus } from "@/entities/intake.types";
import { listIntakes } from "@/services/intakeService";
import { IntakeStatusBadge } from "../components/IntakeStatusBadge";
import { IntakeActionButtons } from "../components/IntakeActionButtons";
import { supabase } from "@/lib/supabase";

interface EnrichedIntake extends ServiceIntake {
    enrichedCustomerName?: string;
    enrichedLicensePlate?: string;
}

const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function ServiceIntakeList() {
    const router = useRouter();
    const [intakes, setIntakes] = React.useState<EnrichedIntake[]>([]);
    const [filteredIntakes, setFilteredIntakes] = React.useState<EnrichedIntake[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = React.useState<IntakeStatus | "all">("all");
    const [searchQuery, setSearchQuery] = React.useState("");

    // Enrich intake data with customer and vehicle info from Supabase
    const enrichIntakeData = async (intake: ServiceIntake): Promise<EnrichedIntake> => {
        const enriched: EnrichedIntake = { ...intake };

        try {
            // Get customer name from booking
            if (intake.bookingId) {
                const { data: booking } = await supabase
                    .from('bookinghuykt')
                    .select('customerid')
                    .eq('bookingid', intake.bookingId)
                    .single();

                if (booking) {
                    const { data: customer } = await supabase
                        .from('useraccount')
                        .select('firstname, lastname')
                        .eq('userid', booking.customerid)
                        .single();

                    if (customer) {
                        enriched.enrichedCustomerName = `${customer.firstname || ''} ${customer.lastname || ''}`.trim();
                    }
                }
            }

            // Get license plate from vehicle
            if (intake.vehicleId) {
                try {
                    const { data: vehicle } = await supabase
                        .from('vehicle')
                        .select('*')
                        .eq('vehicleid', intake.vehicleId)
                        .single();

                    if (vehicle) {
                        enriched.enrichedLicensePlate = vehicle.licenseplate || vehicle.licensePlate || '';
                    }
                } catch (err) {
                    console.error('Error fetching vehicle:', err);
                }
            }
        } catch (error) {
            console.error('Failed to enrich intake data:', error);
        }

        return enriched;
    };

    const loadIntakes = React.useCallback(async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const data = await listIntakes({
                status: statusFilter !== "all" ? statusFilter : undefined,
            });

            // Enrich all intakes with customer and vehicle data
            const enrichedData = await Promise.all(
                data.map(intake => enrichIntakeData(intake))
            );

            setIntakes(enrichedData);
        } catch (error) {
            console.error("Failed to load intakes:", error);
            toast.error("Không thể tải danh sách Service Intake");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [statusFilter]);

    React.useEffect(() => {
        loadIntakes();
    }, [loadIntakes]);

    // Client-side filtering
    React.useEffect(() => {
        let filtered = intakes;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (intake) =>
                    intake.bookingCode?.toLowerCase().includes(query) ||
                    intake.customerName?.toLowerCase().includes(query) ||
                    intake.customerPhone?.toLowerCase().includes(query) ||
                    intake.licensePlate?.toLowerCase().includes(query) ||
                    intake.id.toLowerCase().includes(query)
            );
        }

        setFilteredIntakes(filtered);
    }, [intakes, searchQuery]);

    const handleActionSuccess = (updatedIntake: ServiceIntake) => {
        setIntakes((prev) =>
            prev.map((intake) => (intake.id === updatedIntake.id ? updatedIntake : intake))
        );
        toast.success("Cập nhật thành công!");
    };

    const handleViewDetail = (intakeId: string) => {
        router.push(`/staff/service-intake/${intakeId}`);
    };

    const handleCreateNew = () => {
        router.push("/staff/service-intake/create");
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-md">
                            <ClipboardCheck className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Service & Intake</h1>
                    </div>
                    <p className="text-muted-foreground ml-[60px]">
                        Vehicle intake and pre-service inspection management
                    </p>
                </div>
                <Button
                    onClick={handleCreateNew}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Intake
                </Button>
            </div>

            {/* Filters */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Filter className="h-5 w-5 text-purple-600" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by booking code, customer, or license plate..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-gray-300"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as IntakeStatus | "all")}
                        >
                            <SelectTrigger className="border-gray-300">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                                <SelectItem value="INSPECTING">Inspecting</SelectItem>
                                <SelectItem value="VERIFIED">Verified</SelectItem>
                                <SelectItem value="FINALIZED">Finalized</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            onClick={() => loadIntakes(true)}
                            disabled={isRefreshing}
                            className="border-gray-300 hover:bg-gray-50"
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                            />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <ClipboardCheck className="h-5 w-5 text-purple-600" />
                            Intake List ({filteredIntakes.length})
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {filteredIntakes.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                            <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-sm">
                                <AlertCircle className="h-12 w-12 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">No intakes found</p>
                            <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new intake</p>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold">Intake ID</TableHead>
                                        <TableHead className="font-semibold">Booking Code</TableHead>
                                        <TableHead className="font-semibold">Customer</TableHead>
                                        <TableHead className="font-semibold">License Plate</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Created</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredIntakes.map((intake) => (
                                        <TableRow key={intake.id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="font-mono text-xs text-gray-600">
                                                {intake.id.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                {intake.bookingCode ? (
                                                    <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                                                        {intake.bookingCode}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                                                        Walk-in
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {intake.enrichedCustomerName || intake.customerName || "-"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {intake.customerPhone || "-"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono border-gray-300">
                                                    {intake.enrichedLicensePlate ||
                                                        (intake.licensePlate && intake.licensePlate !== 'string' ? intake.licensePlate : "-")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <IntakeStatusBadge status={intake.status} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-gray-700">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    {formatDateTime(intake.createdAt)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetail(intake.id)}
                                                        className="hover:bg-purple-50 hover:text-purple-700"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <IntakeActionButtons
                                                        intake={intake}
                                                        onSuccess={handleActionSuccess}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
