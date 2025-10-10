"use client";

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { UserFilters } from "@/components/admin/UserFilters";
import { UserTable } from "@/components/admin/UserTable";
import { UserForm } from "@/components/admin/UserForm";
import { userService } from "@/services/userService";
import type {
  User,
  UserFilters as UserFiltersType,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/entities/user.types";

export default function ManagerUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFiltersType>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers(filters);
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers(filters);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    const emptyFilters: UserFiltersType = {};
    setFilters(emptyFilters);
    setFilteredUsers(users);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      await loadUsers(); // Reload data
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Có lỗi xảy ra khi xóa người dùng");
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      await userService.updateUser(userId, { isActive: !user.isActive });
      await loadUsers(); // Reload data
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái người dùng");
    }
  };

  const handleFormSubmit = async (
    data: CreateUserRequest | UpdateUserRequest
  ) => {
    try {
      setIsFormLoading(true);

      if (editingUser) {
        // Update user
        await userService.updateUser(editingUser.id, data as UpdateUserRequest);
      } else {
        // Create new user
        await userService.createUser(data as CreateUserRequest);
      }

      setIsFormOpen(false);
      setEditingUser(null);
      await loadUsers(); // Reload data
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Có lỗi xảy ra khi lưu dữ liệu");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý người dùng
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý danh sách người dùng trong hệ thống (Admin, Staff,
              Technician, Member)
            </p>
          </div>
          <Button
            onClick={handleCreateUser}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        onReset={handleResetFilters}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      )}

      {/* Users table */}
      {!isLoading && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredUsers.length} / {users.length} người dùng
            </div>
          </div>

          <UserTable
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleUserStatus}
          />
        </>
      )}

      {/* User Form Modal */}
      <UserForm
        user={editingUser}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />
    </div>
  );
}
