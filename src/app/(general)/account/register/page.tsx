"use client";

import { useState } from "react";
import { ChevronDown, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";


export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast(); // Initialize the toast hook
  
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, location, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Trigger error toast
        toast(data.message || "Something went wrong.", "error");
        setIsLoading(false);
        return;
      }

      // Trigger success toast
      toast("Account created successfully.", "success");
      
      // Redirect the user to login
      router.push("/account/login");
    } catch (err) {
      // Trigger fallback error toast
      toast("An unexpected error occurred. Please try again.", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-foreground font-sans antialiased flex flex-col items-center justify-center py-24 px-6">
      <div className="w-full max-w-[440px] bg-white border border-gray-200 p-8 md:p-12 shadow-sm">
        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="font-display text-2xl font-medium tracking-tight uppercase">
            Create Account Gent
          </h1>
          <p className="text-xs text-muted mt-3 leading-relaxed">
            Join us to manage your orders, save your favorites, and checkout faster.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="FULL NAME"
              className="w-full px-6 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-6 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors appearance-none cursor-pointer text-foreground invalid:text-gray-400"
              required
              disabled={isLoading}
            >
              <option value="" disabled className="text-gray-400">
                SELECT LOCATION
              </option>
              <option value="NG">Nigeria</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="EU">European Union</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-muted" strokeWidth={1.5} />
            </div>
          </div>

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
              minLength={6}
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

          <div className="pt-2 pb-4 text-center">
            <p className="text-[9px] text-muted uppercase tracking-widest leading-relaxed">
              By creating an account, you agree to our <br />
              <Link
                href="/terms"
                className="text-foreground border-b border-foreground pb-0.5 hover:text-muted hover:border-muted transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-foreground border-b border-foreground pb-0.5 hover:text-muted hover:border-muted transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Account"}
              {!isLoading && (
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                  strokeWidth={1.5}
                />
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center flex flex-col items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
            Already have an account?
          </p>
          <Link
            href="/account/login"
            className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-foreground pb-0.5 hover:text-muted hover:border-muted transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}