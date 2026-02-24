import Navbar from "@/components/shared/Navbar";
import React from "react";
import { ToastProvider } from "@/context/ToastContext";

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-foreground relative">
        <Navbar />
        <main className="">{children}</main>
      </div>
    </ToastProvider>
  );
}
