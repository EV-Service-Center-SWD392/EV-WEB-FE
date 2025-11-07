"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  TrendingUp,
  AlertTriangle,
  FileCheck
} from "lucide-react";
import { certificateService } from "@/services/certificateService";
import { userCertificateService } from "@/services/userCertificateService";
import type {
  Certificate,
  TechnicianWithCertificates,
  PendingCertificate,
  CreateCertificateDto,
  AssignCertificateDto
} from "@/entities/certificate.types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";

export default function AdminTechnicianCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianWithCertificates[]>([]);
  const [pendingCertificates, setPendingCertificates] = useState<PendingCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"certificates" | "technicians" | "pending">("certificates");
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  
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
      const [certsData, techsData, pendingData] = await Promise.all([
        certificateService.getCertificates(),
        userCertificateService.getTechniciansWithCertificates(),
        userCertificateService.getPendingCertificates(),
      ]);
      setCertificates(certsData);
      setTechnicians(techsData);
      setPendingCertificates(pendingData.data || []);
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

  const filteredCertificates = certificates.filter((cert) =>
    cert.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTechnicians = technicians.filter((tech) =>
    tech.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    totalCertificates: certificates.length,
    activeCertificates: certificates.filter(c => c.isActive).length,
    totalTechnicians: technicians.length,
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý chứng chỉ</h1>
          <p className="text-gray-600 mt-1">Quản lý chứng chỉ và phân công cho kỹ thuật viên</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Gán chứng chỉ
              </Button>
            </DialogTrigger>
            <DialogContent>
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
            <DialogContent>
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
            <CardTitle className="text-sm font-medium text-gray-600">Tổng chứng chỉ</CardTitle>
            <Award className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.activeCertificates} đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Kỹ thuật viên</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tỷ lệ có chứng chỉ</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTechnicians > 0 
                ? Math.round((technicians.filter(t => t.validCertificatesCount > 0).length / stats.totalTechnicians) * 100)
                : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">KTV có chứng chỉ</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
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
          Kỹ thuật viên
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
            activeTab === "certificates" 
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
                          onClick={() => setEditingCertificate(cert)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
        <div className="grid gap-4">
          {filteredTechnicians.map((tech) => (
            <Card key={tech.userId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      {tech.userName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{tech.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {tech.validCertificatesCount} chứng chỉ
                    </div>
                    <Badge variant={tech.isActive ? "secondary" : "outline"} className="mt-1">
                      {tech.isActive ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tech.certificates && tech.certificates.length > 0 ? (
                  <div className="space-y-2">
                    {tech.certificates.map((cert) => (
                      <div
                        key={cert.userCertificateId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Award className="h-4 w-4 text-gray-600" />
                          <div>
                            <div className="font-medium text-sm">{cert.certificateName}</div>
                            {cert.expiryDate && (
                              <div className="text-xs text-gray-500">
                                Hết hạn: {new Date(cert.expiryDate).toLocaleDateString('vi-VN')}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            cert.status === 'Approved' ? "secondary" :
                            cert.status === 'Pending' ? "outline" :
                            "destructive"
                          }
                        >
                          {cert.status === 'Approved' ? 'Đã duyệt' :
                           cert.status === 'Pending' ? 'Chờ duyệt' :
                           cert.status === 'Rejected' ? 'Từ chối' : 'Thu hồi'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Chưa có chứng chỉ nào
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Tab */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingCertificates.length === 0 ? (
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
            pendingCertificates.map((cert) => (
              <Card key={cert.userCertificateId} className="border-orange-200 bg-orange-50/30">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-orange-600" />
                        <div>
                          <h3 className="font-semibold">{cert.certificateName}</h3>
                          <p className="text-sm text-gray-600">{cert.userName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Yêu cầu: {new Date(cert.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span>Hiệu lực: {cert.daysUntilExpiry} ngày</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApproveCertificate(cert.userCertificateId)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Phê duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectCertificate(cert.userCertificateId)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}