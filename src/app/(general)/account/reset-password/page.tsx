"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { resetPassword } from "@/app/actions/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("idle");

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      if (!token) throw new Error("Invalid or missing reset token.");

      const response = await resetPassword(token, password);
      if (response.success) {
        setStatus("success");
        setMessage("Your password has been reset.");
      } else {
        setStatus("error");
        setMessage(response.error || "Failed to reset password.");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] bg-white border border-gray-200 p-8 md:p-12 shadow-sm">
      <div className="mb-10 text-center">
        <h1 className="font-display text-2xl font-medium tracking-tight uppercase">
          New Password
        </h1>
        <p className="text-xs text-muted mt-3 leading-relaxed">
          {status === "success"
            ? "Your password has been successfully updated."
            : "Please enter your new password below."}
        </p>
      </div>

      {status === "success" ? (
        <div className="pt-2">
          <Link
            href="/authentication/signin"
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 group"
          >
            Back to Login
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {status === "error" && (
            <div className="text-[9px] font-bold uppercase tracking-widest text-red-500 mb-4 text-center">
              {message}
            </div>
          )}

          {/* New Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="NEW PASSWORD"
              className="w-full pl-6 pr-12 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="CONFIRM PASSWORD"
              className="w-full pl-6 pr-12 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating..." : "Update Password"}
              {!isLoading && (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function SetNewPasswordPage() {
  return (
    <div className="min-h-[80vh] bg-[#FAFAFA] text-foreground font-sans antialiased flex flex-col items-center justify-center py-24 px-6">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
