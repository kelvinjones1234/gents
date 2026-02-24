// "use client";

// import { useState, useEffect } from "react";
// import { X, Minus, Plus, Lock, ArrowRight, Trash2 } from "lucide-react";

// // --- DUMMY DATA ---
// const CART_ITEMS = [
//   {
//     id: 1,
//     name: "Caviar Leather Cat Collar",
//     variant: "Beluga Dark Blue",
//     size: "Petite",
//     price: 87500,
//     originalPrice: 125000,
//     image:
//       "https://images.unsplash.com/photo-1597843786411-a7fa8d626156?auto=format&fit=crop&q=80&w=300&h=300",
//     quantity: 1,
//   },
//   {
//     id: 2,
//     name: "Stella Dog Toy Bone",
//     variant: "Midnight",
//     size: "One Size",
//     price: 34300,
//     originalPrice: 49000,
//     image:
//       "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=300&h=300",
//     quantity: 1,
//   },
// ];

// interface CartDrawerProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
//   const [items, setItems] = useState(CART_ITEMS);
//   const [mounted, setMounted] = useState(false);

//   // Handle hydration mismatch
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Prevent background scroll when cart is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }
//   }, [isOpen]);

//   const updateQuantity = (id: number, change: number) => {
//     setItems((prev) =>
//       prev.map((item) =>
//         item.id === id
//           ? { ...item, quantity: Math.max(1, item.quantity + change) }
//           : item,
//       ),
//     );
//   };

//   const removeItem = (id: number) => {
//     setItems((prev) => prev.filter((item) => item.id !== id));
//   };

//   const subtotal = items.reduce(
//     (acc, item) => acc + item.price * item.quantity,
//     0,
//   );

//   if (!mounted) return null;

//   return (
//     <>
//       {/* 1. DARK BACKDROP OVERLAY */}
//       <div
//         className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity duration-500 ${
//           isOpen
//             ? "opacity-100 pointer-events-auto"
//             : "opacity-0 pointer-events-none"
//         }`}
//         onClick={onClose}
//       />

//       {/* 2. SLIDING DRAWER PANEL */}
//       <div
//         className={`fixed top-0 right-0 h-[100dvh] w-full md:w-[480px] bg-white text-foreground z-[100] transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col border-l border-gray-200 shadow-2xl ${
//           isOpen ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         {/* --- HEADER --- */}
//         <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-200">
//           <div className="flex items-center gap-2">
//             <h2 className="text-[11px] font-bold tracking-widest uppercase text-foreground">
//               Shopping Bag
//             </h2>
//             <span className="text-[11px] text-muted">({items.length})</span>
//           </div>
//           <button
//             onClick={onClose}
//             className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-muted transition-colors"
//           >
//             <span>Close</span>
//             <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
//           </button>
//         </div>

//         {/* --- SCROLLABLE CONTENT --- */}
//         <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 hide-scrollbar">
//           {items.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-full space-y-4">
//               <p className="text-xs uppercase tracking-widest text-muted">
//                 Your bag is currently empty.
//               </p>
//               <button
//                 onClick={onClose}
//                 className="px-8 py-4 border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors duration-300"
//               >
//                 Start Shopping
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-10">
//               {/* CART ITEMS LIST */}
//               {items.map((item) => (
//                 <div key={item.id} className="flex gap-6">
//                   {/* Image */}
//                   <div className="w-24 h-32 bg-[#FAFAFA] shrink-0 relative border border-gray-100 overflow-hidden group">
//                     <img
//                       src={item.image}
//                       alt={item.name}
//                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                     />
//                   </div>

//                   {/* Details */}
//                   <div className="flex-1 flex flex-col justify-between py-1">
//                     <div>
//                       <div className="flex justify-between items-start mb-1">
//                         <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground leading-relaxed max-w-[180px]">
//                           {item.name}
//                         </h3>
//                         <p className="text-[11px] font-bold tracking-wide tabular-nums text-foreground">
//                           ₦{item.price.toLocaleString()}
//                         </p>
//                       </div>

//                       <div className="text-[10px] text-muted uppercase tracking-widest space-y-0.5">
//                         <p>{item.variant}</p>
//                         <p>{item.size}</p>
//                       </div>
//                     </div>

//                     {/* Quantity & Controls */}
//                     <div className="flex items-center justify-between mt-4">
//                       <div className="flex items-center border border-gray-200">
//                         <button
//                           onClick={() => updateQuantity(item.id, -1)}
//                           className="px-3 py-2 hover:bg-gray-50 transition-colors"
//                         >
//                           <Minus className="w-3 h-3 text-muted" />
//                         </button>
//                         <span className="text-[10px] font-bold w-4 text-center tabular-nums">
//                           {item.quantity}
//                         </span>
//                         <button
//                           onClick={() => updateQuantity(item.id, 1)}
//                           className="px-3 py-2 hover:bg-gray-50 transition-colors"
//                         >
//                           <Plus className="w-3 h-3 text-muted" />
//                         </button>
//                       </div>

//                       <button
//                         onClick={() => removeItem(item.id)}
//                         className="text-[9px] font-bold uppercase tracking-widest text-muted hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 pb-0.5"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* --- UPSELL / NEWSLETTER STYLE SECTION --- */}
//           <div className="mt-16 pt-12 border-t border-gray-200">
//             <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-6">
//               Exclusive Offers
//             </h3>
//             <div className="bg-[#FAFAFA] p-6 border border-gray-100">
//               <p className="text-[11px] uppercase tracking-widest text-foreground leading-relaxed mb-4">
//                 Join our newsletter for 10% off your next order.
//               </p>
//               <div className="flex gap-0">
//                 <input
//                   type="email"
//                   placeholder="EMAIL"
//                   className="w-full px-4 py-3 bg-white border border-gray-200 border-r-0 text-[10px] font-bold tracking-widest uppercase focus:outline-none placeholder:text-gray-300"
//                 />
//                 <button className="px-6 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-foreground transition-colors duration-300">
//                   <ArrowRight className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* --- CHECKOUT FOOTER --- */}
//         {items.length > 0 && (
//           <div className="bg-white border-t border-gray-200 p-6 md:p-8 space-y-6">
//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
//                   Subtotal
//                 </span>
//                 <span className="text-[12px] font-bold tracking-wide tabular-nums text-foreground">
//                   ₦{subtotal.toLocaleString()}
//                 </span>
//               </div>
//               <p className="text-[9px] text-muted uppercase tracking-widest text-right">
//                 Shipping & taxes calculated at checkout
//               </p>
//             </div>

//             <button className="w-full py-4 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 flex items-center justify-center gap-2">
//               <Lock className="w-3 h-3" />
//               Secure Checkout
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }







// src/components/CartDrawer.tsx
"use client";

import { useEffect, useState } from "react";
import { X, Minus, Plus, Lock } from "lucide-react";
import { useCart } from "@/context/CartContext"; // Import hook

export default function CartDrawer() {
  // Use the hook instead of local state
  const { 
    isOpen, 
    toggleCart, 
    items, 
    updateQuantity, 
    removeItem, 
    subtotal 
  } = useCart();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* 1. OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity duration-500 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleCart}
      />

      {/* 2. DRAWER */}
      <div
        className={`fixed top-0 right-0 h-[100dvh] w-full md:w-[480px] bg-white text-foreground z-[100] transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col border-l border-gray-200 shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-foreground">
              Shopping Bag
            </h2>
            <span className="text-[11px] text-muted">({items.length})</span>
          </div>
          <button
            onClick={toggleCart}
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-muted transition-colors"
          >
            <span>Close</span>
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 hide-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
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
                // Use item.key for React Key
                <div key={item.key} className="flex gap-6">
                  <div className="w-24 h-32 bg-[#FAFAFA] shrink-0 relative border border-gray-100 overflow-hidden group">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground leading-relaxed max-w-[180px]">
                          {item.name}
                        </h3>
                        <p className="text-[11px] font-bold tracking-wide tabular-nums text-foreground">
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="text-[10px] text-muted uppercase tracking-widest space-y-0.5">
                        {/* Display Variant Name if it exists */}
                        {item.variantName && <p>{item.variantName}</p>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="px-3 py-2 hover:bg-gray-50 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3 text-muted" />
                        </button>
                        <span className="text-[10px] font-bold w-4 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-50 transition-colors"
                          disabled={item.quantity >= item.maxStock}
                        >
                          <Plus className="w-3 h-3 text-muted" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-[9px] font-bold uppercase tracking-widest text-muted hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 pb-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  Subtotal
                </span>
                <span className="text-[12px] font-bold tracking-wide tabular-nums text-foreground">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>
            </div>
            <button className="w-full py-4 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              Secure Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}