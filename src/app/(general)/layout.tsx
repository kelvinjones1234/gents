"use client"; 

import React, { Suspense } from "react";
import Navbar from "@/app/(general)/components/Navbar";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext"; 
import CartDrawer from "./components/CartDrawer";
import NextTopLoader from 'nextjs-toploader'; // 1. Import TopLoader
import { Loader2 } from "lucide-react";

// 2. Create a reusable Brand Loader component
export const BrandLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
      Gent / Loading
    </span>
  </div>
);

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <CartProvider>
        {/* 3. Add TopLoader for instant feedback on all clicks */}
        <NextTopLoader 
          color="#000" 
          showSpinner={false} 
          shadow="none"
          height={4}
        />
        
        <div className="min-h-screen bg-background text-foreground relative">
          <Navbar />
          
          <Suspense fallback={<BrandLoader />}>
            <main className="">{children}</main>
          </Suspense>

          <CartDrawer />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}