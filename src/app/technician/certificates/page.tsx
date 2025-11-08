"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Eye,
  FileText,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { userCertificateService } from "@/services/userCertificateService";
import type {
  UserCertificate,
  RequestCertificateDto,
} from "@/entities/certificate.types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth";

export default function TechnicianCertificatesPage() {
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [viewingCertificateImage, setViewingCertificateImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form state
  const [newCertificate, setNewCertificate] = useState<RequestCertificateDto>({
    name: "",
    description: "",
    imageFile: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.log("No user ID found");
        return;
      }

      const data = await userCertificateService.getUserCertificates(user.id);
      console.log("📊 Certificates data from API:", data);
      setCertificates(data);
    } catch (error) {
      console.error("Failed to load certificates:", error);
      toast.error("Không thể tải danh sách chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  // Load certificates when component mounts or user changes
  useEffect(() => {
    loadCertificates();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file hình ảnh");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      setNewCertificate({ ...newCertificate, imageFile: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCertificate = async () => {
    if (!newCertificate.name.trim()) {
      toast.error("Vui lòng nhập tên chứng chỉ");
      return;
    }

    if (!newCertificate.imageFile) {
      toast.error("Vui lòng tải lên hình ảnh chứng chỉ");
      return;
    }

    if (!user?.id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    try {
      setIsSubmitting(true);
      await userCertificateService.requestCertificate(newCertificate, user.id);
      toast.success("Gửi yêu cầu chứng chỉ thành công! Vui lòng đợi phê duyệt.");
      setSubmitDialogOpen(false);
      setNewCertificate({ name: "", description: "", imageFile: undefined });
      setImagePreview(null);
      await loadCertificates();
    } catch (error: unknown) {
      console.error("Failed to submit certificate:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error.response as { data?: { message?: string } })?.data?.message
        : "Không thể gửi yêu cầu chứng chỉ";
      toast.error(errorMessage || "Không thể gửi yêu cầu chứng chỉ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewImage = (imageUrl: string | null) => {
    if (imageUrl) {
      setViewingCertificateImage(imageUrl);
      setImageDialogOpen(true);
    } else {
      toast.error("Không tìm thấy hình ảnh chứng chỉ");
    }
  };

  const filteredCertificates = certificates.filter((cert) =>
    cert.certificateName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats from API response
  // API returns status in UPPERCASE (APPROVED, PENDING, REJECTED, REVOKED)
  const stats = {
    total: certificates.length,
    approved: certificates.filter(c => {
      const status = c.status?.toUpperCase();
      return (status === 'APPROVED' || status === 'APPROVED') && 
             c.isActive && 
             (!c.expiryDate || new Date(c.expiryDate) >= new Date());
    }).length,
    pending: certificates.filter(c => {
      const status = c.status?.toUpperCase();
      return status === 'PENDING';
    }).length,
    expired: certificates.filter(c =>
      c.expiryDate && new Date(c.expiryDate) < new Date()
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý chứng chỉ</h1>
          <p className="text-gray-600 mt-1">Xem và quản lý chứng chỉ của bạn</p>
        </div>
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Gửi chứng chỉ mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Gửi chứng chỉ mới</DialogTitle>
              <DialogDescription>
                Điền thông tin chứng chỉ và tải lên hình ảnh. Yêu cầu sẽ được gửi đến quản lý để phê duyệt.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Tên chứng chỉ <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="VD: Chứng chỉ sửa chữa xe điện cấp 2"
                  value={newCertificate.name}
                  onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Mô tả</label>
                <Textarea
                  placeholder="Mô tả chi tiết về chứng chỉ (tùy chọn)..."
                  value={newCertificate.description || ""}
                  onChange={(e) => setNewCertificate({ ...newCertificate, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Hình ảnh chứng chỉ <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                              e.preventDefault();
                              setImagePreview(null);
                              setNewCertificate({ ...newCertificate, imageFile: undefined });
                            }}
                          >
                            Xóa
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click để tải lên</span> hoặc kéo thả
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Lưu ý:</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Chứng chỉ sẽ được gửi đến quản lý để phê duyệt</li>
                      <li>Hình ảnh phải rõ ràng, đầy đủ thông tin</li>
                      <li>Bạn sẽ nhận được thông báo khi chứng chỉ được phê duyệt</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitDialogOpen(false);
                  setImagePreview(null);
                  setNewCertificate({ name: "", description: "", imageFile: undefined });
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitCertificate}
                disabled={!newCertificate.name || !newCertificate.imageFile || isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng chứng chỉ</CardTitle>
            <Award className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Tất cả chứng chỉ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Đã duyệt</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-gray-500 mt-1">Có hiệu lực</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Chờ phê duyệt</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">Đang xử lý</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Hết hạn</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
            <p className="text-xs text-gray-500 mt-1">Cần gia hạn</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm chứng chỉ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Danh sách chứng chỉ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">STT</TableHead>
                <TableHead>TÊN CHỨNG CHỈ</TableHead>
                <TableHead>NGÀY CẤP</TableHead>
                <TableHead>NGÀY HẾT HẠN</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead className="text-right">HÀNH ĐỘNG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Award className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-gray-900 font-medium">Chưa có chứng chỉ nào</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Nhấn &quot;Gửi chứng chỉ mới&quot; để thêm chứng chỉ đầu tiên
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCertificates.map((cert, index) => (
                  <TableRow key={cert.userCertificateId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="font-medium">{cert.certificateName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {cert.createdAt
                          ? new Date(cert.createdAt).toLocaleDateString('vi-VN')
                          : "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cert.expiryDate ? (
                        <div>
                          <div className="text-sm">
                            {new Date(cert.expiryDate).toLocaleDateString('vi-VN')}
                          </div>
                          <div className={`text-xs ${new Date(cert.expiryDate) < new Date()
                              ? 'text-red-600'
                              : (cert.daysUntilExpiry && cert.daysUntilExpiry < 30)
                                ? 'text-orange-600'
                                : 'text-gray-500'
                            }`}>
                            {new Date(cert.expiryDate) < new Date()
                              ? 'Đã hết hạn'
                              : cert.daysUntilExpiry
                                ? `Còn ${cert.daysUntilExpiry} ngày`
                                : 'Còn hiệu lực'}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          cert.status?.toUpperCase() === 'APPROVED'
                            ? "bg-green-100 text-green-800 border-green-200" :
                            cert.status?.toUpperCase() === 'PENDING'
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                              cert.status?.toUpperCase() === 'REJECTED'
                                ? "bg-red-100 text-red-800 border-red-200" :
                                cert.status?.toUpperCase() === 'REVOKED'
                                  ? "bg-gray-100 text-gray-800 border-gray-200" :
                                  ""
                        }
                      >
                        {cert.status?.toUpperCase() === 'APPROVED' ? 'Đã duyệt' :
                          cert.status?.toUpperCase() === 'PENDING' ? 'Chờ duyệt' :
                            cert.status?.toUpperCase() === 'REJECTED' ? 'Bị từ chối' :
                              cert.status?.toUpperCase() === 'REVOKED' ? 'Đã thu hồi' : cert.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleViewImage(cert.certificateImage ?? null)}
                        title="Xem hình ảnh chứng chỉ"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Certificate Image Viewer Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>Hình ảnh chứng chỉ</DialogTitle>
            <DialogDescription>
              Xem hình ảnh chứng chỉ đã tải lên
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
