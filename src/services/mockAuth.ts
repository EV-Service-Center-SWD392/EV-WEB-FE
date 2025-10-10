export type Role = "member" | "staff" | "technician" | "admin";

export interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  username: string;
  role: Role;
  phoneNumber: string;
  address: string;
  avatar?: string;
  createdAt: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

// 🎯 Mock Database - 4 Test Accounts
export const MOCK_ACCOUNTS: MockUser[] = [
  {
    id: "1",
    email: "admin@evservice.com",
    password: "123456",
    name: "Nguyễn Văn Admin",
    username: "admin",
    role: "admin",
    phoneNumber: "0901234567",
    address: "123 Admin Street, Quận 1, TPHCM",
    avatar:
      "https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    email: "staff@evservice.com",
    password: "123456",
    name: "Trần Thị Staff",
    username: "staff",
    role: "staff",
    phoneNumber: "0902345678",
    address: "456 Staff Avenue, Quận 3, TPHCM",
    avatar:
      "https://ui-avatars.com/api/?name=Staff&background=2563eb&color=fff",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "3",
    email: "technician@evservice.com",
    password: "123456",
    name: "Lê Văn Technician",
    username: "technician",
    role: "technician",
    phoneNumber: "0903456789",
    address: "789 Tech Road, Quận 7, TPHCM",
    avatar:
      "https://ui-avatars.com/api/?name=Technician&background=ea580c&color=fff",
    createdAt: "2024-02-01T00:00:00.000Z",
  },
  {
    id: "4",
    email: "member@evservice.com",
    password: "123456",
    name: "Phạm Thị Member",
    username: "member",
    role: "member",
    phoneNumber: "0904567890",
    address: "321 Member Lane, Quận 2, TPHCM",
    avatar:
      "https://ui-avatars.com/api/?name=Member&background=9333ea&color=fff",
    createdAt: "2024-02-15T00:00:00.000Z",
  },
];

// 🔐 Mock Login Function
export async function mockLogin(
  email: string,
  password: string
): Promise<LoginResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const user = MOCK_ACCOUNTS.find(
    (account) => account.email === email && account.password === password
  );

  if (!user) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  // Generate mock JWT token
  const token = `mock-jwt-${user.id}-${Date.now()}`;

  return {
    access_token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

// 📝 Mock Register Function
export async function mockRegister(payload: {
  name: string;
  email: string;
  password: string;
  username?: string;
  phoneNumber?: string;
  address?: string;
}): Promise<{ id: string; message: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Check if email already exists
  const existingUser = MOCK_ACCOUNTS.find(
    (account) => account.email === payload.email
  );
  if (existingUser) {
    throw new Error("Email đã được sử dụng");
  }

  // Check if username already exists (if provided)
  if (payload.username) {
    const existingUsername = MOCK_ACCOUNTS.find(
      (account) => account.username === payload.username
    );
    if (existingUsername) {
      throw new Error("Username đã được sử dụng");
    }
  }

  // Mock success response
  const newUser: MockUser = {
    id: `user-${Date.now()}`,
    email: payload.email,
    password: payload.password,
    name: payload.name,
    username: payload.username || `user${Date.now()}`,
    role: "member", // Default role for new registrations
    phoneNumber: payload.phoneNumber || "",
    address: payload.address || "",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name)}&background=random`,
    createdAt: new Date().toISOString(),
  };

  // Add to mock database (in real app, this would be saved to database)
  MOCK_ACCOUNTS.push(newUser);

  return {
    id: newUser.id,
    message: "Đăng ký thành công! Bạn có thể đăng nhập ngay.",
  };
}

// 👤 Mock Me Function
export async function mockMe(token: string): Promise<{
  id: string;
  name: string;
  email: string;
  role: Role;
}> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!token || !token.startsWith("mock-jwt-")) {
    throw new Error("Token không hợp lệ");
  }

  // Extract user ID from token (in real app, decode JWT)
  const tokenParts = token.split("-");
  const userId = tokenParts[2];

  const user = MOCK_ACCOUNTS.find((account) => account.id === userId);

  if (!user) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// 🔄 Mock Forgot Password
export async function mockForgotPassword(
  email: string
): Promise<{ message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const user = MOCK_ACCOUNTS.find((account) => account.email === email);

  if (!user) {
    throw new Error("Email không tồn tại trong hệ thống");
  }

  return {
    message: `Liên kết đặt lại mật khẩu đã được gửi đến ${email}. Vui lòng kiểm tra email của bạn.`,
  };
}

// 🔑 Mock Reset Password
export async function mockResetPassword(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In real app, validate reset token
  if (!token) {
    throw new Error("Token không hợp lệ");
  }

  if (newPassword.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
  }

  return {
    message:
      "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.",
  };
}

// 📊 Mock Statistics (for dashboards)
export async function mockGetStats(
  role: Role
): Promise<Record<string, unknown>> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  switch (role) {
    case "admin":
      return {
        totalUsers: 1250,
        totalStaff: 15,
        totalTechnicians: 25,
        totalMembers: 1200,
        activeServices: 45,
        monthlyRevenue: 850000000,
        systemHealth: 98.5,
        apiCalls: 15420,
        responseTime: 120,
        errorRate: 0.2,
      };

    case "staff":
      return {
        managedTechnicians: 8,
        activeTasks: 12,
        completedTasks: 45,
        pendingAssignments: 3,
        teamPerformance: 92.5,
      };

    case "technician":
      return {
        todayTasks: 3,
        weeklyCompleted: 18,
        averageRating: 4.8,
        toolsAvailable: 12,
        workingHours: 8.5,
      };

    case "member":
      return {
        myVehicles: 2,
        upcomingServices: 1,
        loyaltyPoints: 1250,
        totalSpent: 15500000,
        lastServiceDate: "2024-09-15",
      };

    default:
      return {};
  }
}

// 🚗 Mock Vehicles (for member dashboard)
export async function mockGetVehicles(_userId: string) {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return [
    {
      id: "vehicle-1",
      model: "Tesla Model 3",
      licensePlate: "30A-12345",
      year: 2022,
      status: "active",
      batteryHealth: 95,
      lastService: "2024-08-15",
      nextService: "2024-11-15",
    },
    {
      id: "vehicle-2",
      model: "VinFast VF8",
      licensePlate: "51G-67890",
      year: 2023,
      status: "in_service",
      batteryHealth: 88,
      lastService: "2024-09-20",
      nextService: "2024-12-20",
    },
  ];
}
