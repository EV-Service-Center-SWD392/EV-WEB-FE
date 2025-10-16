import {
  User,
  UserRole,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
} from "@/entities/user.types";

// Mock data for development
const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@evservice.com",
    role: UserRole.ADMIN,
    phone: "0123456789",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "2",
    name: "Staff Member",
    email: "staff@evservice.com",
    role: UserRole.STAFF,
    phone: "0123456790",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    isActive: true,
  },
  {
    id: "3",
    name: "Technician A",
    email: "tech1@evservice.com",
    role: UserRole.TECHNICIAN,
    phone: "0123456791",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    isActive: true,
  },
  {
    id: "4",
    name: "Customer John",
    email: "customer@gmail.com",
    role: UserRole.MEMBER,
    phone: "0123456792",
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
    isActive: true,
  },
];

export const userService = {
  async getUsers(filters?: UserFilters): Promise<User[]> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockUsers];

    if (filters?.role) {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    if (filters?.name) {
      const search = filters.name.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      );
    }

    if (filters?.isActive !== undefined) {
      filtered = filtered.filter((user) => user.isActive === filters.isActive);
    }

    return filtered;
  },

  async getUser(id: string): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockUsers.find((user) => user.id === id) || null;
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    mockUsers.push(newUser);
    return newUser;
  },

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const userIndex = mockUsers.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return mockUsers[userIndex];
  },

  async deleteUser(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const userIndex = mockUsers.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    mockUsers.splice(userIndex, 1);
  },
};
