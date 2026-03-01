// "use client"; // Ensure this is a client component if using Providers directly

// import React from "react";
// import Navbar from "@/app/(general)/components/Navbar";
// import { ToastProvider } from "@/context/ToastContext";
// import { CartProvider } from "@/context/CartContext"; // <--- 1. Import Provider
// import CartDrawer from "./components/CartDrawer";

// export default function GeneralLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ToastProvider>
//       <CartProvider>
//         {" "}
//         {/* <--- 3. Wrap everything */}
//         <div className="min-h-screen bg-background text-foreground relative">
//           <Navbar />
//           <main className="">{children}</main>

//           {/* 4. Add the Drawer here. 
//               It is hidden by default and controlled by the Context. 
//               Since it uses 'fixed' positioning, it will overlay correctly. */}
//           <CartDrawer />
//         </div>
//       </CartProvider>
//     </ToastProvider>
//   );
// }




"use client"; 

import React, { Suspense } from "react"; // 1. Import Suspense
import Navbar from "@/app/(general)/components/Navbar";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext"; 
import CartDrawer from "./components/CartDrawer";

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <CartProvider>
        <div className="min-h-screen bg-background text-foreground relative">
          <Navbar />
          
          {/* 2. Wrap the children in the Suspense boundary */}
          <Suspense 
            fallback={
              <div className="min-h-screen flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted">
                Loading...
              </div>
            }
          >
            <main className="">{children}</main>
          </Suspense>

          <CartDrawer />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}