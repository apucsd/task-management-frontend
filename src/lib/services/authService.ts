import { api, ApiResponse } from "@/lib/api";
import type {
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
  ResetPasswordInput,
  UserProfile,
  AuthSessionData,
} from "@/types/auth";

// Re-export types for backwards compatibility
export type {
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
  ResetPasswordInput,
  UserProfile,
  AuthSessionData,
};

export const authService = {
  async login(data: LoginInput): Promise<ApiResponse<AuthSessionData>> {
    const res = await api.post<ApiResponse<AuthSessionData>>("/auth/login", data);
    return res.data;
  },

  async register(data: RegisterInput): Promise<ApiResponse<any>> {
    const res = await api.post<ApiResponse<any>>("/auth/register", data);
    return res.data;
  },

  async verifyOtp(data: { email: string; otp: number | string }): Promise<ApiResponse<any>> {
    const res = await api.post<ApiResponse<any>>("/auth/verify-otp", data);
    return res.data;
  },

  async resendRegistrationOtp(email: string): Promise<ApiResponse<any>> {
    const res = await api.post<ApiResponse<any>>("/auth/resend-registration-otp", {
      email,
      otpType: "REGISTRATION",
    });
    return res.data;
  },

  async resendOtp(email: string, type: string = "REGISTRATION"): Promise<ApiResponse<any>> {
    const res = await api.post<ApiResponse<any>>("/auth/resend-otp", { email, type });
    return res.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    const res = await api.post<ApiResponse<any>>("/auth/forgot-password", { email });
    return res.data;
  },

  async resetPassword(data: ResetPasswordInput): Promise<ApiResponse<any>> {
    const res = await api.post<ApiResponse<any>>("/auth/reset-password", data);
    return res.data;
  },

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const res = await api.get<ApiResponse<UserProfile>>("/users/profile");
    return res.data;
  },
};
