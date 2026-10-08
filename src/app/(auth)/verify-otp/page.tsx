"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiRotateCw } from "react-icons/fi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { authService } from "@/lib/services/authService";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("pendingEmail");
    if (!stored) router.push("/register");
    else setEmail(stored);
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authService.verifyOtp({
        email,
        otp: Number(otp),
      });

      const otpType = sessionStorage.getItem("otpType");
      const resetToken =
        (data as any)?.data?.resetToken ||
        (data as any)?.resetToken ||
        (data as any)?.data?.token ||
        (data as any)?.token;

      toast.success(data?.message || "OTP verified successfully");

      if (otpType === "RESET_PASSWORD" || resetToken) {
        if (resetToken) {
          localStorage.setItem("resetToken", resetToken);
        }
        sessionStorage.removeItem("pendingEmail");
        sessionStorage.removeItem("otpType");
        router.push("/reset-password");
        return;
      }

      sessionStorage.removeItem("pendingEmail");
      sessionStorage.removeItem("otpType");
      router.push("/login");
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    try {
      const otpType = sessionStorage.getItem("otpType");
      if (otpType === "RESET_PASSWORD") {
        const data = await authService.forgotPassword(email);
        toast.success(data?.message || "Reset OTP sent successfully");
      } else {
        const data = await authService.resendRegistrationOtp(email);
        toast.success(data?.message || "OTP sent successfully");
      }
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiCheckCircle size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Verify Your Email</h1>
        <p className="text-xs text-slate-500 mt-1">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-slate-700">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <input
            type="text"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white"
          />

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-4 text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1.5 mx-auto transition"
        >
          <FiRotateCw className={resending ? "animate-spin" : ""} size={14} />
          Resend Code
        </button>
      </div>
    </div>
  );
}
