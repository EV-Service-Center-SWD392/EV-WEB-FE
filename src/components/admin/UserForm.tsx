"use client";

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserRole,
  type User,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "@/entities/user.types";

interface UserFormProps {
  user?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (_data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({
  user,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: UserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: UserRole.MEMBER,
    phone: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Don't prefill password for edit
        role: user.role,
        phone: user.phone || "",
        isActive: user.isActive,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: UserRole.MEMBER,
        phone: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên là bắt buộc";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc khi tạo mới";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (user) {
        // Update user
        const updateData: UpdateUserRequest = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone || undefined,
          isActive: formData.isActive,
        };
        await onSubmit(updateData);
      } else {
        // Create new user
        const createData: CreateUserRequest = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone || undefined,
        };
        await onSubmit(createData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {user ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={errors.name ? "border-red-300" : ""}
              placeholder="Nhập tên người dùng"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={errors.email ? "border-red-300" : ""}
              placeholder="Nhập email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {user ? "Mật khẩu mới (để trống nếu không thay đổi)" : "Mật khẩu"}
              {!user && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={errors.password ? "border-red-300" : ""}
              placeholder={user ? "Nhập mật khẩu mới" : "Nhập mật khẩu"}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Vai trò */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value as UserRole })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.STAFF}>Staff</SelectItem>
                <SelectItem value={UserRole.TECHNICIAN}>Technician</SelectItem>
                <SelectItem value={UserRole.MEMBER}>Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className={errors.phone ? "border-red-300" : ""}
              placeholder="Nhập số điện thoại"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Trạng thái (chỉ hiện khi sửa) */}
          {user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <Select
                value={formData.isActive.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value === "true" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Nút hành động */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isLoading ? "Đang xử lý..." : user ? "Cập nhật" : "Tạo mới"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
