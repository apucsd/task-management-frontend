import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://task-management-backend-1-4aae.onrender.com/api/v1";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp?: string;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR TO ATTACH JWT TOKEN
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getApiErrorMessage = (err: any): string => {
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) {
    return message.join(", ");
  }
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }
  return err?.message || "Something went wrong";
};

export default api;
