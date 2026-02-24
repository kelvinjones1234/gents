"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  ShoppingCart,
  MessageSquare,
  Mail,
  Calendar,
  Tag,
  Settings,
  LogOut,
  X,
  Box,
  Layers,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Categories", href: "/dashboard/categories", icon: Layers },

    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Mail", href: "/mail", icon: Mail },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Brands", href: "/brands", icon: Tag },
  ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[260px] bg-[#FAFAFA] border-r border-gray-200 z-50 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 shrink-0 bg-white">
          <Link
            href="/"
            className="flex items-center gap-3 text-foreground group"
          >
            <Box
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              strokeWidth={1.5}
            />
            <span className="font-display text-lg font-medium tracking-tight uppercase mt-1">
              Gents
            </span>
          </Link>
          {/* Mobile Close Button */}
          <button
            className="lg:hidden text-muted hover:text-foreground transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto hide-scrollbar py-6 flex flex-col gap-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 group ${
                  isActive
                    ? "bg-foreground text-white"
                    : "text-muted hover:bg-gray-100 hover:text-foreground"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-white" : "text-muted group-hover:text-foreground"}`}
                  strokeWidth={1.5}
                />
                <span className="mt-0.5">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-1 bg-white shrink-0">
          <Link
            href="/settings"
            className="flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted hover:bg-gray-100 hover:text-foreground transition-colors duration-300 group"
          >
            <Settings
              className="w-4 h-4 text-muted group-hover:text-foreground"
              strokeWidth={1.5}
            />
            <span className="mt-0.5">Settings</span>
          </Link>
          <button className="w-full flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted hover:bg-red-50 hover:text-red-600 transition-colors duration-300 group">
            <LogOut
              className="w-4 h-4 text-muted group-hover:text-red-600"
              strokeWidth={1.5}
            />
            <span className="mt-0.5">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
