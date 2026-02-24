"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast(); // Initialize the toast hook

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, // Prevents automatic redirect so we can handle errors
      });

      if (res?.error) {
        // Trigger error toast
        toast("Invalid email or password.", "error");
      } else {
        // Trigger success toast
        toast("Signed in successfully.", "success");
        router.push("/"); // Redirect to your home or dashboard
        router.refresh(); // Refresh the router to update the server session
      }
    } catch (err) {
      // Trigger fallback error toast
      toast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-foreground font-sans antialiased flex flex-col items-center justify-center py-24 px-6">
      <div className="w-full max-w-[440px] bg-white border border-gray-200 p-8 md:p-12 shadow-sm">
        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="font-display text-2xl font-medium tracking-tight uppercase">
            Welcome Back Gent
          </h1>
          <p className="text-xs text-muted mt-3 leading-relaxed">
            Please enter your details to access your account.
          </p>
        </div>

        {/* Form */}
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
              type={showPassword ? "text" : "password"} // Dynamic type
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD"
              className="w-full pl-6 pr-12 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
              required
              disabled={isLoading}
            />
            {/* Show/Hide Password Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors focus:outline-none"
              tabIndex={-1} // Prevents tab from focusing the icon button during form fill
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
          <Link
            href="/account/register"
            className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-foreground pb-0.5 hover:text-muted hover:border-muted transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}