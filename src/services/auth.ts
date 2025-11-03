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
import type { components } from "./schema";

// 🎛️ Toggle để switch between real API and mock API
const USE_MOCK_API = false;

// Types from OpenAPI schema
type LoginDto = components["schemas"]["LoginDto"];
type RegisterDto = components["schemas"]["RegisterDto"];
type CreateStaffDto = components["schemas"]["CreateStaffDto"];
type RefreshTokenRequest = components["schemas"]["RefreshTokenRequest"];
type RevokeTokenRequest = components["schemas"]["RevokeTokenRequest"];
type AuthResultDto = components["schemas"]["AuthResultDto"];

export type Role = "customer" | "staff" | "technician" | "admin";
export type User = { id: string; name: string; email: string; role: Role };

// Map mockLogin return to AuthResultDto
function mapMockLoginToAuthResult(
  mock: Awaited<ReturnType<typeof mockLogin>>
): AuthResultDto {
  return {
    userId: mock.user.id,
    email: mock.user.email,
    fullName: mock.user.name,
    role: mock.user.role,
    accessToken: mock.access_token,
    refreshToken: null,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
}

// Keep existing function signatures but return values match schema where applicable
export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResultDto> {
  if (USE_MOCK_API) {
    const mock = await mockLogin(payload.email, payload.password);
    return mapMockLoginToAuthResult(mock);
  }

  const { data } = await api.post<AuthResultDto>(
    "/Auth/login",
    payload as LoginDto
  );
  return data;
}

export async function register(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}): Promise<AuthResultDto> {
  if (USE_MOCK_API) {
    const res = await mockRegister({
      name: `${payload.firstName} ${payload.lastName}`,
      email: payload.email,
      password: payload.password,
    });
    return {
      userId: res.id,
      email: payload.email,
      fullName: `${payload.firstName} ${payload.lastName}`,
      role: "member",
      accessToken: `mock-jwt-${res.id}-${Date.now()}`,
      refreshToken: null,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }

  // Map payload directly to API's RegisterDto
  const apiPayload: RegisterDto = {
    email: payload.email,
    password: payload.password,
    confirmPassword: payload.password,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phoneNumber: payload.phoneNumber ?? null,
    address: payload.address ?? null,
  };

  const { data } = await api.post<AuthResultDto>("/Auth/register", apiPayload);
  return data;
}

export async function createStaff(payload: {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  birthday?: string;
  role: string;
}): Promise<AuthResultDto> {
  if (USE_MOCK_API) {
    const reg = await mockRegister({
      name: `${payload.firstName} ${payload.lastName}`,
      email: payload.email,
      password: payload.password,
      phoneNumber: payload.phoneNumber,
      address: payload.address,
    });

    return {
      userId: reg.id,
      email: payload.email,
      fullName: `${payload.firstName} ${payload.lastName}`,
      role: payload.role,
      accessToken: `mock-jwt-${reg.id}-${Date.now()}`,
      refreshToken: null,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }

  const apiPayload: CreateStaffDto = {
    email: payload.email,
    password: payload.password,
    confirmPassword: payload.confirmPassword ?? payload.password,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phoneNumber: payload.phoneNumber ?? null,
    address: payload.address ?? null,
    birthday: payload.birthday ?? null,
    role: payload.role,
  };

  const { data } = await api.post<AuthResultDto>(
    "/Auth/create-staff",
    apiPayload
  );
  return data;
}

export async function me() {
  if (USE_MOCK_API) {
    const token =
      typeof window !== "undefined"
        ? (localStorage.getItem("auth_token") ?? "")
        : "";
    return await mockMe(token);
  }

  // Call the backend /Auth/me endpoint (keep path consistent with other Auth calls)
  const { data } = await api.get("/Auth/me");

  // The real API may return a few shapes depending on backend implementation.
  // Normalize it to our local `User` shape: { id, name, email, role }
  // Common shapes handled:
  // - { userId, fullName, email, role }
  // - { id, name, email, role }
  if (!data) return null;

  const raw = data as unknown;
  // Prefer data.user if present (some APIs wrap payload in `user`), else use data itself
  let userObj: Record<string, unknown> | null = null;
  if (typeof raw === "object" && raw !== null) {
    const rec = raw as Record<string, unknown>;
    if ("user" in rec && typeof rec.user === "object" && rec.user !== null) {
      userObj = rec.user as Record<string, unknown>;
    } else {
      userObj = rec;
    }
  }

  if (!userObj) return null;

  const id = (userObj["userId"] as string) ?? (userObj["id"] as string) ?? "";
  const name =
    (userObj["fullName"] as string) ??
    (userObj["name"] as string) ??
    `${(userObj["firstName"] as string) ?? ""} ${(userObj["lastName"] as string) ?? ""}`.trim();
  const email = (userObj["email"] as string) ?? "";
  const role = (userObj["role"] as string) ?? ("member" as Role);

  const normalized: User = {
    id,
    name,
    email,
    role: role as Role,
  };

  return normalized;
}

export async function refreshToken(payload: {
  refreshToken?: string | null;
  accessToken?: string | null;
}): Promise<AuthResultDto> {
  if (USE_MOCK_API) {
    const token =
      payload.accessToken ??
      (typeof window !== "undefined"
        ? (localStorage.getItem("auth_token") ?? "")
        : "");
    if (!token) throw new Error("No token provided");
    const user = await mockMe(token);
    return {
      userId: user.id,
      email: user.email,
      fullName: user.name,
      role: user.role,
      accessToken: `mock-jwt-${user.id}-${Date.now()}`,
      refreshToken: null,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }

  const apiPayload: RefreshTokenRequest = {
    refreshToken: payload.refreshToken ?? null,
    accessToken: payload.accessToken ?? null,
  };

  const { data } = await api.post<AuthResultDto>(
    "/Auth/refresh-token",
    apiPayload
  );
  return data;
}

export async function revokeToken(payload: {
  refreshToken?: string | null;
}): Promise<boolean> {
  if (USE_MOCK_API) {
    return true;
  }

  const apiPayload: RevokeTokenRequest = {
    refreshToken: payload.refreshToken ?? null,
  };
  const { data } = await api.post<boolean>("/Auth/revoke-token", apiPayload);
  return data;
}

export async function revokeAllTokens(): Promise<boolean> {
  if (USE_MOCK_API) {
    return true;
  }

  const { data } = await api.post<boolean>("/Auth/revoke-all-tokens");
  return data;
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
