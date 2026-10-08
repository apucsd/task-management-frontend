"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", formData);
      toast.success(data?.message || "User registered successfully. Please check your email for verification.");
      // REDIRECT TO OTP VERIFICATION WITH EMAIL
      sessionStorage.setItem("pendingEmail", formData.email);
      router.push("/verify-otp");
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-sm text-slate-500 mt-1">
            Start organizing tasks with TaskFlow
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Full Name
            </label>
            <div className="relative mt-1">
              <FiUser
                className="absolute left-3.5 top-3.5 text-slate-400"
                size={16}
              />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

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
            <label className="text-xs font-semibold text-slate-700">
              Password
            </label>
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
            {loading ? "Creating account..." : "Continue"}
            <FiArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
