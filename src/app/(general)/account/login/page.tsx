"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // <-- ADDED useSearchParams
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // <-- INITIALIZED
  const { toast } = useToast(); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW: GRAB CALLBACK URL ---
  // If no callbackUrl is provided, default to the home page ("/")
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, 
      });

      if (res?.error) {
        toast("Invalid email or password.", "error");
      } else {
        toast("Signed in successfully.", "success");
        
        // --- NEW: REDIRECT TO CALLBACK URL ---
        router.push(callbackUrl); 
        router.refresh(); 
      }
    } catch (err) {
      toast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-foreground font-sans antialiased flex flex-col items-center justify-center py-24 px-6">
      <div className="w-full max-w-[440px] bg-white border border-gray-200 p-8 md:p-12 shadow-sm">
        <div className="mb-10 text-center">
          <h1 className="font-display text-2xl font-medium tracking-tight uppercase">
            Welcome Back Gent
          </h1>
          <p className="text-xs text-muted mt-3 leading-relaxed">
            Please enter your details to access your account.
          </p>
        </div>
 
        <form className="space-y-4" onSubmit={handleSubmit}>
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

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD"
              className="w-full pl-6 pr-12 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors focus:outline-none"
              tabIndex={-1} 
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Eye className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>
          </div>

          <div className="flex justify-end pt-1 pb-2">
            <Link
              href="/forgot-password"
              className="text-[9px] font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
              {!isLoading && (
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                  strokeWidth={1.5}
                />
              )}
            </button>
          </div>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center flex flex-col items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
            Don't have an account?
          </p>
          {/* Note: If you want Registration to also loop back to the cart, pass the callbackUrl here too */}
          <Link
            href={`/account/register${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-foreground pb-0.5 hover:text-muted hover:border-muted transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}