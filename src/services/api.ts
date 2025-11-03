import axios from "axios";
import { toast } from "sonner";

// Compute base once and log so we can see what the browser bundle picked up.
const NEXT_PUBLIC_API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
).replace(/\/+$/, "");
if (typeof window !== "undefined") {
  // Browser runtime debug — open devtools console to see this
  // eslint-disable-next-line no-console
  console.debug(
    "[api] NEXT_PUBLIC_API_BASE_URL (raw) =",
    process.env.NEXT_PUBLIC_API_BASE_URL
  );
  // eslint-disable-next-line no-console
  console.debug(
    "[api] computed baseURL =",
    NEXT_PUBLIC_API_BASE || "(empty - using current origin)"
  );
}

export const api = axios.create({
  baseURL: NEXT_PUBLIC_API_BASE,
  withCredentials: false, // true nếu backend dùng cookie HttpOnly
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token"); // tạm thời cho dev
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    // Normalize backend uniform response: { data: ..., isSuccess: boolean, message?: string, errors?: any }
    const payload = res.data;

    if (payload && typeof payload === "object" && "isSuccess" in payload) {
      // If API signals failure, show toast and reject so callers can catch
      if (!payload.isSuccess) {
        if (typeof window !== "undefined") {
          try {
            toast.error(payload.message ?? "Lỗi từ server");
          } catch {
            // ignore toast errors in non-interactive environments
          }
        }
        // Attach the original payload to response.data for callers
        res.data = payload; // keep payload so caller can inspect .data/.message
        return Promise.reject({ response: res });
      }

      // Success: unwrap nested `data` so callers doing `const { data } = await api.post(...)` get the payload
      res.data = payload.data ?? payload;
      return res;
    }

    // Not a wrapped payload — return as-is
    return res;
  },
  (err) => {
    // Global error handler: try to extract message and show toast
    try {
      if (typeof window !== "undefined") {
        const resp = (err && err.response && err.response.data) || null;
        const message = resp?.message || err.message || "Lỗi mạng";
        toast.error(message);
      }
    } catch {
      // swallow
    }
    return Promise.reject(err);
  }
);
