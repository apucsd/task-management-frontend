"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiArrowLeft, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      toast.success(data?.message || "Please check your email for reset password otp");
      sessionStorage.setItem("pendingEmail", email);
      sessionStorage.setItem("otpType", "RESET_PASSWORD");
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
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <FiArrowLeft size={14} />
          Back to sign in
        </Link>

        {isSubmitted ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Check Your Email</h1>
            <p className="text-sm text-slate-500 mt-2">
              We have sent password reset instructions to{" "}
              <span className="font-semibold text-slate-700">{email}</span>.
            </p>

            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-6 text-xs text-indigo-600 font-semibold hover:underline block mx-auto"
            >
              Didn't receive the email? Try again
            </button>

            <Link
              href="/login"
              className="mt-6 w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">
                Forgot Password?
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter your registered email address and we'll send you
                instructions to reset your password.
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
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
          </>
        )}
      </div>
    </div>
  );
}
