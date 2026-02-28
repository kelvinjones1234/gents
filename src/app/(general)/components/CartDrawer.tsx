"use client";

import dynamic from "next/dynamic";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartItem from "./CartItem";
// import CheckoutButton from "./CheckoutButton";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation"; // <-- ADDED HOOKS

const CheckoutButton = dynamic(() => import("./CheckoutButton"), { 
  ssr: false 
});

export default function CartDrawer() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams(); // <-- TO READ URL PARAMS
  const pathname = usePathname(); // <-- TO GET CURRENT PATH

  const { isOpen, toggleCart, items, updateQuantity, removeItem, subtotal } =
    useCart();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- NEW: AUTO-OPEN CART LOGIC ---
  useEffect(() => {
    if (searchParams.get("openCart") === "true") {
      // If the cart isn't already open, open it
      if (!isOpen) {
        toggleCart(); 
      }

      // Clean up the URL so refreshing the page doesn't pop the cart open again
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("openCart");
      const newUrl = newParams.toString()
        ? `${pathname}?${newParams.toString()}`
        : pathname;

      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, isOpen, toggleCart, pathname, router]);
  // ---------------------------------

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const handleUpdateQuantity = useCallback(
    (key: string, qty: number) => {
      updateQuantity(key, qty);
    },
    [updateQuantity],
  );

  const handleRemoveItem = useCallback(
    (key: string) => {
      removeItem(key);
    },
    [removeItem],
  );

  if (!mounted) return null;

  return createPortal(
    <div className="relative z-[9999]">
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${
          isOpen
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={toggleCart}
        aria-hidden="true"
      />

      <div
        className={`fixed top-0 right-0 h-[100dvh] w-full md:w-[480px] bg-white text-foreground shadow-2xl transform transition-transform duration-500 cubic-bezier(0.25, 1, 0.5, 1) flex flex-col border-l border-gray-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-foreground">
              Shopping Bag
            </h2>
            <span className="text-[11px] text-muted">({items.length})</span>
          </div>
          <button
            onClick={toggleCart}
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-muted transition-colors p-2 -mr-2 outline-none"
            aria-label="Close cart"
          >
            <span>Close</span>
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 hide-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
              <p className="text-xs uppercase tracking-widest text-muted">
                Your bag is currently empty.
              </p>
              <button
                onClick={toggleCart}
                className="px-8 py-4 border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors duration-300"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {items.map((item) => (
                <CartItem
                  key={item.key}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-6 md:p-8 space-y-6 shrink-0 safe-area-bottom">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  Subtotal
                </span>
                <span className="text-[12px] font-bold tracking-wide tabular-nums text-foreground">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[9px] text-muted text-center uppercase tracking-widest">
                Shipping & taxes calculated at checkout
              </p>
            </div>

            {session?.user?.email ? (
              <CheckoutButton email={session.user.email} amount={subtotal} />
            ) : (
              <button
                onClick={() => {
                  toggleCart();

                  // --- NEW: PASS CALLBACK URL WITH THE OPENCART TRIGGER ---
                  // This tells the login page exactly where to send the user back to
                  const currentUrl = pathname;
                  const callbackUrl = encodeURIComponent(
                    `${currentUrl}?openCart=true`,
                  );

                  router.push(`/account/login?callbackUrl=${callbackUrl}`);
                }}
                className="w-full py-4 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300"
              >
                Sign In to Checkout
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
