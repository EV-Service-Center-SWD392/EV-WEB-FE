"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Award, 
  Calendar, 
  AlertTriangle, 
  Search, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  TrendingUp,
  FileCheck
} from "lucide-react";
import { userCertificateService } from "@/services/userCertificateService";
import type { 
  PendingCertificate, 
  ExpiringCertificate 
} from "@/entities/certificate.types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";

export default function StaffTechnicianCertificatesPage() {
  const [pendingCertificates, setPendingCertificates] = useState<PendingCertificate[]>([]);
  const [expiringCertificates, setExpiringCertificates] = useState<ExpiringCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pendingData, expiringData] = await Promise.all([
        userCertificateService.getPendingCertificates(),
        userCertificateService.getExpiringCertificates(30)
      ]);
      setPendingCertificates(pendingData.data || []);
      setExpiringCertificates(expiringData.data || []);
    } catch (error) {
      console.error("Failed to load certificates:", error);
      toast.error("Không thể tải dữ liệu chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCertificate = async (userCertificateId: string) => {
    try {
      setActionLoading(userCertificateId);
      await userCertificateService.approveCertificate(userCertificateId);
      toast.success("Đã phê duyệt chứng chỉ thành công");
      await loadData();
    } catch (error) {
      console.error("Failed to approve certificate:", error);
      toast.error("Không thể phê duyệt chứng chỉ");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectCertificate = async (userCertificateId: string) => {
    try {
      setActionLoading(userCertificateId);
      await userCertificateService.rejectCertificate(userCertificateId);
      toast.success("Đã từ chối chứng chỉ");
      await loadData();
    } catch (error) {
      console.error("Failed to reject certificate:", error);
      toast.error("Không thể từ chối chứng chỉ");
    } finally {
      setActionLoading(null);
    }
  };


  const filteredPendingCertificates = pendingCertificates.filter((cert) =>
    cert.certificateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpiringCertificates = expiringCertificates.filter((cert) =>
    cert.certificateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    pending: pendingCertificates.length,
    expiring: expiringCertificates.length,
    critical: expiringCertificates.filter(c => (c.daysUntilExpiry || 0) <= 7).length,
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý chứng chỉ</h1>
        <p className="text-gray-600 mt-1">Theo dõi và phê duyệt chứng chỉ của kỹ thuật viên</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Chờ phê duyệt</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">Yêu cầu đang chờ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sắp hết hạn</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.expiring}</div>
            <p className="text-xs text-gray-500 mt-1">Trong 30 ngày tới</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cần xử lý gấp</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.critical}</div>
            <p className="text-xs text-gray-500 mt-1">Hết hạn trong 7 ngày</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên chứng chỉ hoặc kỹ thuật viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Pending Certificates Section */}
      {filteredPendingCertificates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Chứng chỉ chờ phê duyệt</h2>
            <Badge variant="secondary">{filteredPendingCertificates.length}</Badge>
          </div>

          <div className="grid gap-4">
            {filteredPendingCertificates.map((certificate) => (
              <Card key={certificate.userCertificateId} className="border-orange-200 bg-orange-50/30">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-orange-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{certificate.certificateName}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Users className="h-4 w-4" />
                            {certificate.userName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Yêu cầu: {new Date(certificate.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Hiệu lực: {certificate.daysUntilExpiry} ngày</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApproveCertificate(certificate.userCertificateId)}
                        disabled={actionLoading === certificate.userCertificateId}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Phê duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectCertificate(certificate.userCertificateId)}
                        disabled={actionLoading === certificate.userCertificateId}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Certificates Section */}
      {filteredExpiringCertificates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Chứng chỉ sắp hết hạn</h2>
            <Badge variant="secondary">{filteredExpiringCertificates.length}</Badge>
          </div>

          <div className="grid gap-4">
            {filteredExpiringCertificates.map((certificate) => {
              const daysLeft = certificate.daysUntilExpiry || 0;
              const isCritical = daysLeft <= 7;
              const isWarning = daysLeft <= 14 && !isCritical;

              return (
                <Card 
                  key={certificate.userCertificateId} 
                  className={
                    isCritical 
                      ? "border-red-300 bg-red-50/30" 
                      : isWarning 
                      ? "border-yellow-300 bg-yellow-50/30"
                      : "border-gray-200"
                  }
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Award className={`h-5 w-5 ${isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-blue-600'}`} />
                          <div>
                            <h3 className="font-semibold text-gray-900">{certificate.certificateName}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                              <Users className="h-4 w-4" />
                              {certificate.userName}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Hết hạn: {new Date(certificate.expiryDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <Badge 
                            variant={isCritical ? "destructive" : isWarning ? "secondary" : "outline"}
                          >
                            Còn {daysLeft} ngày
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredPendingCertificates.length === 0 && filteredExpiringCertificates.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Tất cả đã ổn!</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? "Không tìm thấy chứng chỉ nào phù hợp với tìm kiếm"
                  : "Không có chứng chỉ chờ phê duyệt hoặc sắp hết hạn"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}