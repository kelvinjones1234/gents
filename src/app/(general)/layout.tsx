// "use client"; 

// import React, { Suspense } from "react"; // 1. Import Suspense
// import Navbar from "@/app/(general)/components/Navbar";
// import { ToastProvider } from "@/context/ToastContext";
// import { CartProvider } from "@/context/CartContext"; 
// import CartDrawer from "./components/CartDrawer";

// export default function GeneralLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ToastProvider>
//       <CartProvider>
//         <div className="min-h-screen bg-background text-foreground relative">
//           <Navbar />
          
//           {/* 2. Wrap the children in the Suspense boundary */}
//           <Suspense 
//             fallback={
//               <div className="min-h-screen flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted">
//                 Loading...
//               </div>
//             }
//           >
//             <main className="">{children}</main>
//           </Suspense>

//           <CartDrawer />
//         </div>
//       </CartProvider>
//     </ToastProvider>
//   );
// }



// "use client"; 

// import React, { Suspense } from "react";
// import Navbar from "@/app/(general)/components/Navbar";
// import { ToastProvider } from "@/context/ToastContext";
// import { CartProvider } from "@/context/CartContext"; 
// import CartDrawer from "./components/CartDrawer";
// import NextTopLoader from 'nextjs-toploader'; // 1. Import TopLoader
// import { Loader2 } from "lucide-react";

// // 2. Create a reusable Brand Loader component
// export const BrandLoader = () => (
//   <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
//     <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
//     <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
//       Gent / Loading
//     </span>
//   </div>
// );

// export default function GeneralLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ToastProvider>
//       <CartProvider>
//         {/* 3. Add TopLoader for instant feedback on all clicks */}
//         <NextTopLoader 
//           color="#000" 
//           showSpinner={false} 
//           shadow="none"
//           height={2}
//         />
        
//         <div className="min-h-screen bg-background text-foreground relative">
//           <Navbar />
          
//           <Suspense fallback={<BrandLoader />}>
//             <main className="">{children}</main>
//           </Suspense>

//           <CartDrawer />
//         </div>
//       </CartProvider>
//     </ToastProvider>
//   );
// }




"use client"; 

import React, { Suspense, useState, useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Navbar from "@/app/(general)/components/Navbar";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext"; 
import CartDrawer from "./components/CartDrawer";
import { Loader2 } from "lucide-react";

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Reset loading state whenever the URL actually changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // 2. Handle the "Back" and "Forward" buttons specifically
  useEffect(() => {
    const handlePopState = () => {
      setIsNavigating(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a");
    
    // Only trigger if it's a valid internal link and not opening in a new tab
    if (
      link && 
      link.href.includes(window.location.origin) && 
      !link.hash &&
      link.target !== "_blank" &&
      !e.metaKey && !e.ctrlKey // Allow cmd/ctrl + click to work normally
    ) {
      // Don't trigger if clicking the same page we're already on
      if (link.href !== window.location.href) {
        setIsNavigating(true);
      }
    }
  }, []);

  return (
    <ToastProvider>
      <CartProvider>
        {/* THE BLUR OVERLAY */}
        {isNavigating && (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-foreground/40 stroke-[1.5px]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/60">
                Gent / Loading
              </span>
            </div>
          </div>
        )}

        <div 
          className="min-h-screen bg-background text-foreground relative"
          onClickCapture={handleLinkClick}
        >
          <Navbar />
          
          <Suspense fallback={null}>
            <main>{children}</main>
          </Suspense>

          <CartDrawer />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}