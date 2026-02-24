"use client";

import React, { useState } from "react";
import { ToastProvider } from "@/context/ToastContext";
import Sidebar from "./components/shared/Sidebar";
import TopHeader from "./components/shared/TopHeader";

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
              {children}
            </div>
          </main>
          
        </div>

      </div>
    </ToastProvider>
  );
}