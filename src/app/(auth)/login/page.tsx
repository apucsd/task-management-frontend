"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";
import { authService } from "@/lib/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authService.login(formData);
      const accessToken = (data as any)?.data?.accessToken || (data as any)?.accessToken;
      if (accessToken) {
        const user = (data as any)?.data?.user || {
          id: (data as any)?.data?.id,
          email: (data as any)?.data?.email,
          name: (data as any)?.data?.name,
        };
        setAuthSession(accessToken, user);
        toast.success(data?.message || "User logged in successfully");

        const redirectParam = typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null;
        router.push(redirectParam || "/");
      }
    } catch (err: any) {
      const errMsg = getApiErrorMessage(err);
      toast.error(errMsg);

      // If user account is unverified, redirect to OTP verification
      const isUnverified =
        err?.response?.data?.requiresVerification ||
        errMsg.toLowerCase().includes("verify your email") ||
        errMsg.toLowerCase().includes("verification");

      if (isUnverified) {
        sessionStorage.setItem("pendingEmail", formData.email);
        sessionStorage.setItem("otpType", "REGISTRATION");
        router.push("/verify-otp");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to your TaskFlow account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Email Address
            </label>
            <div className="relative mt-1">
              <FiMail
                className="absolute left-3.5 top-3.5 text-slate-400"
                size={16}
              />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1">
              <FiLock
                className="absolute left-3.5 top-3.5 text-slate-400"
                size={16}
              />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
            <FiArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
