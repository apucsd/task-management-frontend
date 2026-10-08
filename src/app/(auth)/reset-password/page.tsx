"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { authService } from "@/lib/services/authService";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const resetToken = localStorage.getItem("resetToken");
    if (!resetToken) {
      toast.error("Reset token not found. Please request a new OTP.");
      router.push("/forgot-password");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.resetPassword({
        resetToken,
        newPassword,
      });

      localStorage.removeItem("resetToken");
      toast.success(data?.message || "Password reset successfully");
      router.push("/login");
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiLock size={24} />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a new password to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">
              New Password
            </label>
            <div className="relative mt-1">
              <FiLock
                className="absolute left-3.5 top-3.5 text-slate-400"
                size={16}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <FiLock
                className="absolute left-3.5 top-3.5 text-slate-400"
                size={16}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full mt-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
            <FiArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
