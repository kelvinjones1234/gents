"use client";

import React from "react";
import { Menu, Bell, ChevronDown } from "lucide-react";

interface TopHeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

export default function TopHeader({ setSidebarOpen }: TopHeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left side: Hamburger (Mobile) & Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 text-muted hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <div className="hidden sm:block">
          <h2 className="font-display text-xl md:text-2xl font-medium tracking-tight text-foreground uppercase">
            Hello, Robert Fox{" "}
            <span className="ml-1 animate-wave inline-block origin-bottom-right">
              👋
            </span>
          </h2>
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <div className="flex items-center gap-3">
          <button className="p-2 text-muted hover:text-foreground transition-colors relative">
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

        <button className="flex items-center gap-3 group">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground mt-0.5">
              Robert Fox
            </span>
            <ChevronDown
              className="w-3 h-3 text-muted group-hover:text-foreground transition-colors"
              strokeWidth={2}
            />
          </div>
        </button>
      </div>
    </header>
  );
}
