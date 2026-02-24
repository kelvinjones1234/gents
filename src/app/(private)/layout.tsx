"use client";

import React, { useState, Suspense } from "react"; // Added Suspense
import { ToastProvider } from "@/context/ToastContext";
import Sidebar from "./components/shared/Sidebar";
import TopHeader from "./components/shared/TopHeader";
import { Loader2 } from "lucide-react"; // Ensure you have this or any spinner

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State to manage mobile sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-foreground font-sans antialiased flex">
        
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px] transition-all duration-300">
          
          {/* Top Header */}
          <TopHeader setSidebarOpen={setIsSidebarOpen} />

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden bg-[#FAFAFA] p-6 md:p-8">
            <div className="max-w-7x mx-auto">
              {/* Wrap children in Suspense. This catches any useSearchParams() 
                bailout in child components and prevents build errors.
              */}
              <Suspense fallback={
                <div className="flex w-full h-[50vh] items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted" />
                </div>
              }>
                {children}
              </Suspense>
            </div>
          </main>
          
        </div>

      </div>
    </ToastProvider>
  );
}