"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Award,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  FileCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  Ban,
  Eye,
} from "lucide-react";
import { technicianService } from "@/services/technicianService";
import { certificateService } from "@/services/certificateService";
import { userCertificateService } from "@/services/userCertificateService";
import type { Technician } from "@/entities/technician.types";
import type {
  Certificate,
  TechnicianWithCertificates,
  PendingCertificate,
  UserCertificateDetail,
  CreateCertificateDto,
  AssignCertificateDto
} from "@/entities/certificate.types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";

export default function AdminTechnicianCertificatesPage() {
  // User management states
  const [users, setUsers] = useState<Technician[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [emailFilter, setEmailFilter] = useState("");
  
  // Certificate states
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianWithCertificates[]>([]);
  const [pendingCertificates, setPendingCertificates] = useState<PendingCertificate[]>([]);
  const [allUserCertificates, setAllUserCertificates] = useState<UserCertificateDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "certificates" | "technicians" | "pending">("users");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [viewingCertificateImage, setViewingCertificateImage] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  
  // Form states
  const [newCertificate, setNewCertificate] = useState<CreateCertificateDto>({
    name: "",
    description: "",
  });
  const [assignForm, setAssignForm] = useState<AssignCertificateDto>({
    userId: "",
    certificateId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, certsData, techsData, pendingData, allCertsData] = await Promise.all([
        technicianService.getTechnicians(),
        certificateService.getCertificates(),
        userCertificateService.getTechniciansWithCertificates(),
        userCertificateService.getPendingCertificates(),
        userCertificateService.getAllUserCertificates(),
      ]);
      
      setUsers(usersData);
      setCertificates(certsData);
      setTechnicians(techsData);
      setPendingCertificates(pendingData.data || []);
      setAllUserCertificates(allCertsData || []); // allCertsData is already unwrapped by interceptor
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCertificate = async () => {
    try {
      await certificateService.createCertificate(newCertificate);
      toast.success("Tạo chứng chỉ thành công");
      setCreateDialogOpen(false);
      setNewCertificate({ name: "", description: "" });
      await loadData();
    } catch (error) {
      console.error("Failed to create certificate:", error);
      toast.error("Không thể tạo chứng chỉ");
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa chứng chỉ này?")) return;
    
    try {
      await certificateService.deleteCertificate(id);
      toast.success("Xóa chứng chỉ thành công");
      await loadData();
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      toast.error("Không thể xóa chứng chỉ");
    }
  };

  const handleAssignCertificate = async () => {
    try {
      await userCertificateService.assignCertificate(assignForm);
      toast.success("Gán chứng chỉ thành công");
      setAssignDialogOpen(false);
      setAssignForm({ userId: "", certificateId: "" });
      await loadData();
    } catch (error) {
      console.error("Failed to assign certificate:", error);
      toast.error("Không thể gán chứng chỉ");
    }
  };

  const handleApproveCertificate = async (userCertificateId: string) => {
    try {
      await userCertificateService.approveCertificate(userCertificateId);
      toast.success("Phê duyệt chứng chỉ thành công");
      await loadData();
    } catch (error) {
      console.error("Failed to approve certificate:", error);
      toast.error("Không thể phê duyệt chứng chỉ");
    }
  };

  const handleRejectCertificate = async (userCertificateId: string) => {
    try {
      await userCertificateService.rejectCertificate(userCertificateId);
      toast.success("Từ chối chứng chỉ thành công");
      await loadData();
    } catch (error) {
      console.error("Failed to reject certificate:", error);
      toast.error("Không thể từ chối chứng chỉ");
    }
  };

  const handleRevokeCertificate = async (userCertificateId: string) => {
    if (!confirm("Bạn có chắc muốn thu hồi chứng chỉ này?")) return;
    try {
      await userCertificateService.revokeCertificateStatus(userCertificateId);
      toast.success("Thu hồi chứng chỉ thành công");
      await loadData();
    } catch (error) {
      console.error("Failed to revoke certificate:", error);
      toast.error("Không thể thu hồi chứng chỉ");
    }
  };

  const toggleRowExpansion = (userId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleViewCertificateImage = (imageUrl: string | null) => {
    if (imageUrl) {
      setViewingCertificateImage(imageUrl);
      setImageDialogOpen(true);
    } else {
      toast.error("Chứng chỉ này chưa có hình ảnh");
    }
  };

  const filteredCertificates = certificates.filter((cert) =>
    cert.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTechnicians = technicians.filter((tech) =>
    tech.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group user certificates by userId for technician tab display
  const technicianCertificatesMap = allUserCertificates.reduce((acc, cert) => {
    if (!acc[cert.userId]) {
      acc[cert.userId] = {
        userId: cert.userId,
        userName: cert.userName,
        certificates: []
      };
    }
    acc[cert.userId].certificates.push(cert);
    return acc;
  }, {} as Record<string, { userId: string; userName: string; certificates: UserCertificateDetail[] }>);

  // Get unique technicians from allUserCertificates and merge with user data
  const techniciansWithFullCertificates = Object.values(technicianCertificatesMap)
    .map(techData => {
      // Find matching user data if available
      const userData = users.find(u => u.userId === techData.userId);
      
      // Count valid certificates: APPROVED/Approved/Active status AND active
      const validCount = techData.certificates.filter(c => {
        const isApproved = c.status === 'APPROVED' || c.status === 'Approved' || c.status === 'Active';
        return isApproved && c.isActive;
      }).length;
      
      return {
        userId: techData.userId,
        userName: techData.userName,
        email: userData?.email || '',
        phoneNumber: userData?.phoneNumber || '',
        isActive: userData?.isActive ?? true,
        certificates: techData.certificates,
        validCertificatesCount: validCount,
      };
    })
    .filter(tech =>
      tech.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredUsers = users.filter((user) => {
    const matchesName = user.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmail = user.email?.toLowerCase().includes(emailFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" ? user.isActive : !user.isActive);
    
    return matchesName && matchesEmail && matchesStatus;
  });

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    totalCertificates: allUserCertificates.length, // Total user certificate assignments
    activeCertificates: allUserCertificates.filter(c => 
      c.isActive && 
      (c.status === 'APPROVED' || c.status === 'Approved' || c.status === 'Active')
    ).length,
    totalTechnicians: Object.keys(technicianCertificatesMap).length, // Unique technicians with certificates
    pending: pendingCertificates.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý technicians & Chứng chỉ</h1>
          <p className="text-gray-600 mt-1">Quản lý technicians, chứng chỉ và phân công cho kỹ thuật viên</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Gán chứng chỉ
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Gán chứng chỉ cho kỹ thuật viên</DialogTitle>
                <DialogDescription>
                  Chọn kỹ thuật viên và chứng chỉ để gán
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Kỹ thuật viên</label>
                  <Select
                    value={assignForm.userId}
                    onValueChange={(value) => setAssignForm({ ...assignForm, userId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kỹ thuật viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.userId} value={tech.userId}>
                          {tech.userName} ({tech.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Chứng chỉ</label>
                  <Select
                    value={assignForm.certificateId}
                    onValueChange={(value) => setAssignForm({ ...assignForm, certificateId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chứng chỉ" />
                    </SelectTrigger>
                    <SelectContent>
                      {certificates.filter(c => c.isActive).map((cert) => (
                        <SelectItem key={cert.certificateId} value={cert.certificateId}>
                          {cert.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAssignCertificate} disabled={!assignForm.userId || !assignForm.certificateId}>
                  Gán chứng chỉ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo chứng chỉ
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Tạo chứng chỉ mới</DialogTitle>
                <DialogDescription>
                  Thêm loại chứng chỉ mới vào hệ thống
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tên chứng chỉ *</label>
                  <Input
                    placeholder="VD: Chứng chỉ sửa chữa xe điện cấp 1"
                    value={newCertificate.name}
                    onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mô tả</label>
                  <Input
                    placeholder="Mô tả chi tiết về chứng chỉ..."
                    value={newCertificate.description || ""}
                    onChange={(e) => setNewCertificate({ ...newCertificate, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateCertificate} disabled={!newCertificate.name}>
                  Tạo chứng chỉ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Trong hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Chứng chỉ đã cấp</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.activeCertificates} đang có hiệu lực</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Kỹ thuật viên</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTechnicians}</div>
            <p className="text-xs text-gray-500 mt-1">Tổng số KTV</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Chờ phê duyệt</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">Yêu cầu mới</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "users"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("users")}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Kỹ thuật viên
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "certificates"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("certificates")}
        >
          <Award className="h-4 w-4 inline mr-2" />
          Chứng chỉ
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "technicians"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("technicians")}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Chứng chỉ
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === "pending"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          <FileCheck className="h-4 w-4 inline mr-2" />
          Chờ phê duyệt
          {stats.pending > 0 && (
            <Badge className="ml-2" variant="destructive">
              {stats.pending}
            </Badge>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={
            activeTab === "users"
              ? "Tìm kiếm người dùng..."
              : activeTab === "certificates" 
              ? "Tìm kiếm chứng chỉ..." 
              : activeTab === "technicians"
              ? "Tìm kiếm kỹ thuật viên..."
              : "Tìm kiếm yêu cầu..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Bộ lọc tìm kiếm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  placeholder="Nhập email..."
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div className="text-sm text-gray-600 mb-2">
            Hiển thị {filteredUsers.length} / {users.length} người dùng
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>KỸ THUẬT VIÊN</TableHead>
                  <TableHead>VAI TRÒ</TableHead>
                  <TableHead>SỐ ĐIỆN THOẠI</TableHead>
                  <TableHead>TRẠNG THÁI</TableHead>
                  <TableHead className="text-right">HÀNH ĐỘNG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => {
                    const initials = user.userName
                      ? user.userName.substring(0, 1).toUpperCase()
                      : "?";

                    return (
                      <TableRow key={user.userId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gray-200 text-gray-700">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.userName || "N/A"}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              user.role === "Admin" ? "bg-red-100 text-red-800" :
                              user.role === "Staff" ? "bg-blue-100 text-blue-800" :
                              user.role === "Technician" ? "bg-green-100 text-green-800" :
                              "bg-purple-100 text-purple-800"
                            }
                          >
                            {user.role || "Member"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.phoneNumber || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.isActive
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            {user.isActive ? "Hoạt động" : "Tạm nghỉ"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                              <Lock className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* Certificates Tab */}
      {activeTab === "certificates" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên chứng chỉ</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Số người có</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((cert) => {
                const holdersCount = technicians.filter(t => 
                  t.certificates?.some(c => c.certificateId === cert.certificateId && c.status === 'Approved')
                ).length;

                return (
                  <TableRow key={cert.certificateId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-500" />
                        {cert.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{cert.description || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={cert.isActive ? "secondary" : "outline"}>
                        {cert.isActive ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell>{holdersCount} KTV</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCertificate(cert.certificateId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Technicians Tab */}
      {activeTab === "technicians" && (
        <>
          <div className="text-sm text-gray-600 mb-2">
            Hiển thị {techniciansWithFullCertificates.length} kỹ thuật viên
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>KỸ THUẬT VIÊN</TableHead>
                  <TableHead>SỐ ĐIỆN THOẠI</TableHead>
                  <TableHead>TRẠNG THÁI</TableHead>
                  <TableHead>SỐ CHỨNG CHỈ</TableHead>
                  <TableHead className="text-right">HÀNH ĐỘNG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {techniciansWithFullCertificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Không tìm thấy kỹ thuật viên nào
                    </TableCell>
                  </TableRow>
                ) : (
                  techniciansWithFullCertificates.map((tech, index) => {
                    const isExpanded = expandedRows.has(tech.userId);
                    const initials = tech.userName
                      ? tech.userName.substring(0, 1).toUpperCase()
                      : "?";
                    const hasCertificates = tech.certificates && tech.certificates.length > 0;

                    return (
                      <React.Fragment key={tech.userId}>
                        <TableRow 
                          className={hasCertificates ? "cursor-pointer hover:bg-gray-50" : ""}
                          onClick={() => hasCertificates && toggleRowExpansion(tech.userId)}
                        >
                          <TableCell>
                            {hasCertificates && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(tech.userId);
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{tech.userName || "N/A"}</div>
                                <div className="text-sm text-gray-500">{tech.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{tech.phoneNumber || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                tech.isActive
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              }
                            >
                              {tech.isActive ? "Hoạt động" : "Không hoạt động"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {tech.validCertificatesCount || 0}
                              </Badge>
                              {hasCertificates && (
                                <span className="text-xs text-gray-500">
                                  / {tech.certificates.length} tổng
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row - Certificates Detail */}
                        {isExpanded && hasCertificates && (
                          <TableRow key={`${tech.userId}-expanded`}>
                            <TableCell colSpan={7} className="bg-gray-50 p-0">
                              <div className="p-4">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <Award className="h-4 w-4 text-blue-500" />
                                  Danh sách chứng chỉ ({tech.certificates.length})
                                </h4>
                                <div className="space-y-2">
                                  {tech.certificates.map((cert) => (
                                    <div
                                      key={cert.userCertificateId}
                                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                    >
                                      <div className="flex items-center gap-3 flex-1">
                                        <Award className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                        <div className="flex-1">
                                          <div className="font-medium text-sm">{cert.certificateName}</div>
                                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                            {cert.createdAt && (
                                              <span>Cấp: {new Date(cert.createdAt).toLocaleDateString('vi-VN')}</span>
                                            )}
                                            {cert.expiryDate && (
                                              <span>Hết hạn: {new Date(cert.expiryDate).toLocaleDateString('vi-VN')}</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant={
                                            (cert.status === 'APPROVED' || cert.status === 'Approved' || cert.status === 'Active') ? "default" :
                                            (cert.status === 'PENDING' || cert.status === 'Pending') ? "outline" :
                                            (cert.status === 'REVOKED' || cert.status === 'Revoked') ? "destructive" :
                                            "secondary"
                                          }
                                          className={
                                            (cert.status === 'APPROVED' || cert.status === 'Approved' || cert.status === 'Active') ? "bg-green-100 text-green-800 border-green-200" :
                                            (cert.status === 'PENDING' || cert.status === 'Pending') ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                                            (cert.status === 'REVOKED' || cert.status === 'Revoked') ? "bg-red-100 text-red-800 border-red-200" :
                                            (cert.status === 'REJECTED' || cert.status === 'Rejected') ? "bg-gray-100 text-gray-800 border-gray-200" :
                                            ""
                                          }
                                        >
                                          {(cert.status === 'APPROVED' || cert.status === 'Approved' || cert.status === 'Active') ? 'Đã duyệt' :
                                           (cert.status === 'PENDING' || cert.status === 'Pending') ? 'Chờ duyệt' :
                                           (cert.status === 'REVOKED' || cert.status === 'Revoked') ? 'Đã thu hồi' : 
                                           (cert.status === 'REJECTED' || cert.status === 'Rejected') ? 'Đã bị từ chối' : cert.status}
                                        </Badge>
                                        
                                        {/* View Certificate Image Button */}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewCertificateImage(cert.certificateImage);
                                          }}
                                          title="Xem hình ảnh chứng chỉ"
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        
                                        {(cert.status === 'PENDING' || cert.status === 'Pending') && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 px-3 text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={() => handleApproveCertificate(cert.userCertificateId)}
                                          >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Duyệt
                                          </Button>
                                        )}
                                        {(cert.status === 'APPROVED' || cert.status === 'Approved' || cert.status === 'Active') && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 px-3 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                            onClick={() => handleRevokeCertificate(cert.userCertificateId)}
                                          >
                                            <Ban className="h-4 w-4 mr-1" />
                                            Thu hồi
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* Pending Tab */}
      {activeTab === "pending" && (
        <>
          {(() => {
            // Filter pending certificates from allUserCertificates
            const pendingCerts = allUserCertificates.filter(
              cert => cert.status === 'PENDING' || cert.status === 'Pending'
            ).filter(cert =>
              cert.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              cert.certificateName?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return (
              <>
                <div className="text-sm text-gray-600 mb-2">
                  Hiển thị {pendingCerts.length} chứng chỉ chờ phê duyệt
                </div>

                {pendingCerts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center space-y-3">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                        <h3 className="text-lg font-semibold">Không có yêu cầu chờ phê duyệt</h3>
                        <p className="text-gray-600">Tất cả yêu cầu đã được xử lý</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">STT</TableHead>
                          <TableHead>KỸ THUẬT VIÊN</TableHead>
                          <TableHead>CHỨNG CHỈ</TableHead>
                          <TableHead>NGÀY YÊU CẦU</TableHead>
                          <TableHead>NGÀY HẾT HẠN</TableHead>
                          <TableHead>TRẠNG THÁI</TableHead>
                          <TableHead className="text-right">HÀNH ĐỘNG</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingCerts.map((cert, index) => {
                          const initials = cert.userName
                            ? cert.userName.substring(0, 1).toUpperCase()
                            : "?";

                          return (
                            <TableRow key={cert.userCertificateId}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-orange-100 text-orange-700">
                                      {initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{cert.userName || "N/A"}</div>
                                    <div className="text-xs text-gray-500">ID: {cert.userId}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                  <span className="font-medium">{cert.certificateName}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {cert.createdAt
                                  ? new Date(cert.createdAt).toLocaleDateString('vi-VN')
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                {cert.expiryDate ? (
                                  <div>
                                    <div>{new Date(cert.expiryDate).toLocaleDateString('vi-VN')}</div>
                                    <div className="text-xs text-gray-500">
                                      ({cert.daysUntilExpiry} ngày)
                                    </div>
                                  </div>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-100 text-yellow-800 border-yellow-200"
                                >
                                  Chờ duyệt
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                  {/* View Certificate Image Button */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewCertificateImage(cert.certificateImage);
                                    }}
                                    title="Xem hình ảnh chứng chỉ"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>

                                  {/* Approve Button */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-3 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApproveCertificate(cert.userCertificateId)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Duyệt
                                  </Button>

                                  {/* Reject Button */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleRejectCertificate(cert.userCertificateId)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Từ chối
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </>
            );
          })()}
        </>
      )}

      {/* Certificate Image Viewer Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>Hình ảnh chứng chỉ</DialogTitle>
            <DialogDescription>
              Xem hình ảnh chứng chỉ được upload từ hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            {viewingCertificateImage ? (
              <img
                src={viewingCertificateImage}
                alt="Certificate"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EKhông thể tải ảnh%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p>Chứng chỉ này chưa có hình ảnh</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Đóng
            </Button>
            {viewingCertificateImage && (
              <Button
                onClick={() => window.open(viewingCertificateImage, '_blank')}
              >
                Mở trong tab mới
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}