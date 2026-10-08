export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  status?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password?: string;
}

export interface VerifyOtpInput {
  email: string;
  code: string;
  type?: "REGISTRATION" | "PASSWORD_RESET";
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email?: string;
  code?: string;
  resetToken?: string;
  newPassword?: string;
}

export interface AuthSessionData {
  accessToken: string;
  refreshToken?: string;
  user: UserProfile;
}
