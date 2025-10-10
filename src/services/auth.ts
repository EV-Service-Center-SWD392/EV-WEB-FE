import { api } from "./api";
import {
  mockLogin,
  mockRegister,
  mockMe,
  mockForgotPassword,
  mockResetPassword,
  mockGetStats,
  mockGetVehicles,
} from "./mockAuth";

export type Role = "member" | "staff" | "technician" | "admin";
export type User = { id: string; name: string; email: string; role: Role };

// 🎛️ Toggle để switch giữa real API và mock API
const USE_MOCK_API = true;

export async function login(payload: { email: string; password: string }) {
  if (USE_MOCK_API) {
    return await mockLogin(payload.email, payload.password);
  }

  const { data } = await api.post("/auth/login", payload);
  return data as { access_token?: string; user: User };
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  username?: string;
  phoneNumber?: string;
  address?: string;
}) {
  if (USE_MOCK_API) {
    return await mockRegister(payload);
  }

  const { data } = await api.post("/auth/register", payload);
  return data as { id: string; message: string };
}

export async function me() {
  if (USE_MOCK_API) {
    // Get token from localStorage
    const token = localStorage.getItem("auth_token") || "";
    return await mockMe(token);
  }

  const { data } = await api.get("/auth/me");
  return data as User;
}

export async function forgotPassword(email: string) {
  if (USE_MOCK_API) {
    return await mockForgotPassword(email);
  }

  const { data } = await api.post("/auth/forgot-password", { email });
  return data as { message: string };
}

export async function resetPassword(token: string, newPassword: string) {
  if (USE_MOCK_API) {
    return await mockResetPassword(token, newPassword);
  }

  const { data } = await api.post("/auth/reset-password", {
    token,
    password: newPassword,
  });
  return data as { message: string };
}

export async function getStats(role: Role) {
  if (USE_MOCK_API) {
    return await mockGetStats(role);
  }

  const { data } = await api.get(`/stats/${role}`);
  return data;
}

export async function getVehicles(userId: string) {
  if (USE_MOCK_API) {
    return await mockGetVehicles(userId);
  }

  const { data } = await api.get(`/vehicles/user/${userId}`);
  return data;
}
