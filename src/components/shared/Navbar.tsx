"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  ArrowRight,
  ArrowLeft,
  Instagram,
  Facebook,
} from "lucide-react";
import { NAV_LINKS } from "@/app/constants/navigation";
import CartDrawer from "@/app/(general)/components/CartDrawer";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // New State for Cart

  // Prevent scrolling when the mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* ==========================================
          ANNOUNCEMENT BAR (Disappears on scroll)
          ========================================== */}
      <div className="w-full bg-[#FAFAFA] text-foreground border-b border-gray-200 flex justify-between items-center py-2 px-4 md:px-12 z-30 relative">
        <button
          className="p-1 hover:opacity-60 transition-opacity"
          aria-label="Previous announcement"
        >
          <ArrowLeft
            className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted"
            strokeWidth={1.5}
          />
        </button>

        <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-center truncate px-4">
          Buy Now Pay Later With Afterpay
        </span>

        <button
          className="p-1 hover:opacity-60 transition-opacity"
          aria-label="Next announcement"
        >
          <ArrowRight
            className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted"
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* ==========================================
          MAIN NAVBAR (Sticks to top)
          ========================================== */}
      <nav className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md text-foreground border-b border-muted/20 mx-auto py-4 uppercase tracking-wide text-xs font-medium font-sans transition-colors duration-300">
        <div className="container-main flex justify-between items-center w-full px-6 md:px-12">
          {/* LEFT: Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 w-1/3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-brand-sage transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CENTER: Mobile Toggles & Logo */}
          <div className="w-full md:w-1/3 flex justify-between md:justify-center items-center">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-foreground hover:text-brand-sage transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="font-display text-base md:text-lg font-bold tracking-widest text-brand-charcoal dark:text-foreground"
            >
              GENTS
            </Link>

            {/* Mobile Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="md:hidden p-2 -mr-2 relative text-foreground hover:text-brand-sage transition-colors"
              aria-label="Open Cart"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-foreground text-[9px] text-background">
                2
              </span>
            </button>
          </div>

          {/* RIGHT: Desktop Utilities */}
          <div className="hidden md:flex items-center justify-end space-x-6 w-1/3">
            <button className="hover:text-brand-sage transition-colors duration-200 flex items-center gap-1">
              <Search className="h-4 w-4" strokeWidth={1.5} />
              <span className="sr-only lg:not-sr-only">Search</span>
            </button>

            <Link
              href={`/account/login`}
              className="hover:text-brand-sage transition-colors duration-200 flex items-center gap-1"
            >
              <User className="h-4 w-4" strokeWidth={1.5} />
              <span className="sr-only lg:not-sr-only">Account</span>
            </Link>

            {/* Desktop Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-brand-sage transition-colors duration-200 flex items-center gap-1 group"
            >
              <div className="relative">
                <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                  2
                </span>
              </div>
              <span className="sr-only lg:not-sr-only ml-1">Bag</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ==========================================
          MOBILE SLIDE-OUT MENU (Existing)
          ========================================== */}

      {/* ... (Your existing Dark Overlay & Sidebar Drawer code goes here, unchanged) ... */}

      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-500 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 h-[100dvh] w-[85vw] max-w-[400px] bg-[#FAFAFA] text-foreground z-[60] flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] md:hidden ${
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center py-2 px-6 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 -ml-2 text-foreground hover:opacity-70 transition-opacity"
          >
            <X className="w-6 h-6" strokeWidth={1} />
          </button>
          <span className="font-display font-bold tracking-widest text-xs uppercase">
            GENTS
          </span>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-8 hide-scrollbar">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex justify-between items-center group"
            >
              <span className="text-[11px] font-bold tracking-widest uppercase text-foreground group-hover:text-muted transition-colors duration-300">
                {link.name}
              </span>
              <ArrowRight
                className="w-4 h-4 text-muted/50 group-hover:text-foreground transition-colors duration-300"
                strokeWidth={1}
              />
            </Link>
          ))}

          {/* Sale Link */}
          <Link
            href="/sale"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex justify-between items-center group pt-2"
          >
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#D9534F] group-hover:opacity-70 transition-opacity duration-300">
              SALE
            </span>
          </Link>
        </div>

        {/* Footer */}
        <div className="px-6 pb-10 pt-8 shrink-0 flex flex-col gap-6">
          <div className="w-full h-[1px] bg-gray-200 mb-2"></div>
          <div className="flex flex-col gap-5">
            <a
              href="#"
              className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase text-foreground hover:text-muted transition-colors"
            >
              <Instagram className="w-4 h-4" strokeWidth={1.5} /> Instagram
            </a>
            <a
              href="#"
              className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase text-foreground hover:text-muted transition-colors"
            >
              <Facebook className="w-4 h-4" strokeWidth={1.5} /> Facebook
            </a>
            <a
              href="#"
              className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase text-foreground hover:text-muted transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
              TikTok
            </a>
          </div>
          <div className="w-full h-[1px] bg-gray-200 mt-2 mb-2"></div>
          <button className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-foreground hover:opacity-70 transition-opacity self-start">
            <span className="text-sm leading-none border border-gray-200">
              🇳🇬
            </span>
            NGN ₦
          </button>
        </div>
      </div>

      {/* ==========================================
          CART DRAWER COMPONENT
          ========================================== */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
