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
    const [intakes, setIntakes] = React.useState<ServiceIntake[]>([]);
    const [filteredIntakes, setFilteredIntakes] = React.useState<ServiceIntake[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = React.useState<IntakeStatus | "all">("all");
    const [searchQuery, setSearchQuery] = React.useState("");

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
            setIntakes(data);
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
                    <h1 className="text-3xl font-bold">Service & Intake</h1>
                    <p className="text-muted-foreground">
                        Quản lý tiếp nhận xe và kiểm tra trước dịch vụ
                    </p>
                </div>
                <Button onClick={handleCreateNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo Intake Mới
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Bộ Lọc
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm (mã booking, khách hàng, biển số...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as IntakeStatus | "all")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="Checked_In">Đã Check-in</SelectItem>
                                <SelectItem value="Inspecting">Đang Kiểm Tra</SelectItem>
                                <SelectItem value="Verified">Đã Xác Minh</SelectItem>
                                <SelectItem value="Finalized">Hoàn Tất</SelectItem>
                                <SelectItem value="Cancelled">Đã Hủy</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            onClick={() => loadIntakes(true)}
                            disabled={isRefreshing}
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                            />
                            Làm mới
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            Danh sách Intake ({filteredIntakes.length})
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredIntakes.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Không tìm thấy intake nào
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã Intake</TableHead>
                                        <TableHead>Mã Booking</TableHead>
                                        <TableHead>Khách Hàng</TableHead>
                                        <TableHead>Biển Số</TableHead>
                                        <TableHead>Trạng Thái</TableHead>
                                        <TableHead>Ngày Tạo</TableHead>
                                        <TableHead className="text-right">Thao Tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredIntakes.map((intake) => (
                                        <TableRow key={intake.id}>
                                            <TableCell className="font-mono text-xs">
                                                {intake.id.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                {intake.bookingCode ? (
                                                    <Badge variant="outline">{intake.bookingCode}</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Walk-in</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{intake.customerName || "-"}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {intake.customerPhone || "-"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{intake.licensePlate || "N/A"}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <IntakeStatusBadge status={intake.status} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDateTime(intake.createdAt)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetail(intake.id)}
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
