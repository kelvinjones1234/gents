"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/auth";

export default function RequestResetPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("idle");

    try {
      const response = await requestPasswordReset(email);
      if (response?.success) {
        setStatus("success");
        setMessage(response.message || "Reset link sent to your email.");
      } else {
        setStatus("error");
        setMessage(response?.error || "Failed to send reset email.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#FAFAFA] text-foreground font-sans antialiased flex flex-col items-center justify-center py-24 px-6">
      <div className="w-full max-w-[440px] bg-white border border-gray-200 p-8 md:p-12 shadow-sm">
        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="font-display text-2xl font-medium tracking-tight uppercase">
            Reset Password
          </h1>
          <p className="text-xs text-muted mt-3 leading-relaxed">
            {status === "success"
              ? "Check your inbox for further instructions."
              : "Enter your email to receive a password reset link."}
          </p>
        </div>

        {status === "success" ? (
          <div className="space-y-6 text-center">
            <div className="py-8 flex justify-center">
              <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center">
                <Mail className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">
              {message}
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="text-[9px] font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {status === "error" && (
              <div className="text-[9px] font-bold uppercase tracking-widest text-red-500 mb-4 text-center">
                {message}
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className="w-full px-6 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
                required
                disabled={isLoading}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
                {!isLoading && (
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                    strokeWidth={1.5}
                  />
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-gray-100 text-center flex flex-col items-center gap-4">
          <Link
            href="/authentication/signin"
            className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-foreground pb-0.5 hover:text-muted hover:border-muted transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
