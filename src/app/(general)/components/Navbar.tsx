// "use client";

// import Link from "next/link";
// import { useState, useEffect } from "react";
// import {
//   Menu,
//   Search,
//   ShoppingBag,
//   User,
//   X,
//   ArrowRight,
//   ArrowLeft,
//   Instagram,
//   Facebook,
// } from "lucide-react";
// import { useCart } from "@/context/CartContext"; // <--- 1. Import Context Hook

// // Ensure this path matches your project structure
// const NAV_LINKS = [
//   { name: "Shop", href: "/" },
//   { name: "Collections", href: "/collections" },
//   { name: "About", href: "/about" },
//   { name: "Account", href: "/account/user" },
// ];

// export default function Navbar() {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // 2. Use Context for Cart State
//   const { totalItems, toggleCart } = useCart();

//   // Prevent scrolling when the mobile menu is open
//   useEffect(() => {
//     if (isMobileMenuOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }
//   }, [isMobileMenuOpen]);

//   return (
//     <>
//       {/* ==========================================
//           ANNOUNCEMENT BAR (Disappears on scroll)
//           ========================================== */}
//       <div className="w-full bg-[#FAFAFA] text-foreground border-b border-gray-200 flex justify-between items-center py-2 px-4 md:px-12 z-30 relative">
//         <button
//           className="p-1 hover:opacity-60 transition-opacity"
//           aria-label="Previous announcement"
//         >
//           <ArrowLeft
//             className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted"
//             strokeWidth={1.5}
//           />
//         </button>

//         <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-center truncate px-4">
//           Buy Now Pay Later With Afterpay
//         </span>

//         <button
//           className="p-1 hover:opacity-60 transition-opacity"
//           aria-label="Next announcement"
//         >
//           <ArrowRight
//             className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted"
//             strokeWidth={1.5}
//           />
//         </button>
//       </div>

//       {/* ==========================================
//           MAIN NAVBAR (Sticks to top)
//           ========================================== */}
//       <nav className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md text-foreground border-b border-gray-200 mx-auto py-4 uppercase tracking-wide text-xs font-medium font-sans transition-colors duration-300">
//         <div className="container-main mx-auto flex justify-between items-center w-full px-6 md:px-12">
//           {/* LEFT: Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-8 w-1/3">
//             {NAV_LINKS.map((link) => (
//               <Link
//                 key={link.name}
//                 href={link.href}
//                 className="hover:text-gray-500 transition-colors duration-200"
//               >
//                 {link.name}
//               </Link>
//             ))}
//           </div>

//           {/* CENTER: Mobile Toggles & Logo */}
//           <div className="w-full md:w-1/3 flex justify-between md:justify-center items-center">
//             {/* Mobile Hamburger */}
//             <button
//               onClick={() => setIsMobileMenuOpen(true)}
//               className="md:hidden p-2 -ml-2 text-foreground hover:text-gray-500 transition-colors"
//               aria-label="Open Menu"
//             >
//               <Menu className="h-5 w-5" strokeWidth={1.5} />
//             </button>

//             {/* Logo */}
//             <Link
//               href="/"
//               className="font-display text-xl md:text-2xl font-bold tracking-widest text-foreground"
//             >
//               GENTS
//             </Link>

//             {/* Mobile Cart Trigger */}
//             <button
//               onClick={toggleCart} // <--- 3. Use Context Toggle
//               className="md:hidden p-2 -mr-2 relative text-foreground hover:text-gray-500 transition-colors"
//               aria-label="Open Cart"
//             >
//               <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
//               {totalItems > 0 && (
//                 <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-foreground text-[9px] text-background font-bold">
//                   {totalItems}
//                 </span>
//               )}
//             </button>
//           </div>

//           {/* RIGHT: Desktop Utilities */}
//           <div className="hidden md:flex items-center justify-end space-x-6 w-1/3">
//             <button className="hover:text-gray-500 transition-colors duration-200 flex items-center gap-1">
//               <Search className="h-4 w-4" strokeWidth={1.5} />
//               <span className="sr-only lg:not-sr-only">Search</span>
//             </button>

//             <Link
//               href={`/account/login`}
//               className="hover:text-gray-500 transition-colors duration-200 flex items-center gap-1"
//             >
//               <User className="h-4 w-4" strokeWidth={1.5} />
//               <span className="sr-only lg:not-sr-only">Account</span>
//             </Link>

//             {/* Desktop Cart Trigger */}
//             <button
//               onClick={toggleCart} // <--- 4. Use Context Toggle
//               className="relative hover:text-gray-500 transition-colors duration-200 flex items-center gap-1 group"
//             >
//               <div className="relative">
//                 <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
//                 {totalItems > 0 && (
//                   <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] text-background font-bold">
//                     {totalItems}
//                   </span>
//                 )}
//               </div>
//               <span className="sr-only lg:not-sr-only ml-1">Bag</span>
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* ==========================================
//           MOBILE SLIDE-OUT MENU
//           ========================================== */}

//       {/* Backdrop */}
//       <div
//         className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] transition-opacity duration-500 md:hidden ${
//           isMobileMenuOpen
//             ? "opacity-100 pointer-events-auto"
//             : "opacity-0 pointer-events-none"
//         }`}
//         onClick={() => setIsMobileMenuOpen(false)}
//       />

//       {/* Drawer */}
//       <div
//         className={`fixed top-0 left-0 h-[100dvh] w-[85vw] max-w-[320px] bg-[#FAFAFA] text-foreground z-[60] flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] md:hidden shadow-2xl ${
//           isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center py-6 px-6 shrink-0 border-b border-gray-200">
//           <span className="font-display font-bold tracking-widest text-sm uppercase">
//             Menu
//           </span>
//           <button
//             onClick={() => setIsMobileMenuOpen(false)}
//             className="p-1 -mr-2 text-foreground hover:opacity-70 transition-opacity"
//           >
//             <X className="w-5 h-5" strokeWidth={1.5} />
//           </button>
//         </div>

//         {/* Links */}
//         <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 hide-scrollbar">
//           {NAV_LINKS.map((link) => (
//             <Link
//               key={link.name}
//               href={link.href}
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="flex justify-between items-center group py-2 border-b border-gray-100 last:border-0"
//             >
//               <span className="text-[11px] font-bold tracking-widest uppercase text-foreground group-hover:text-gray-500 transition-colors duration-300">
//                 {link.name}
//               </span>
//               <ArrowRight
//                 className="w-3.5 h-3.5 text-gray-300 group-hover:text-foreground transition-colors duration-300"
//                 strokeWidth={1.5}
//               />
//             </Link>
//           ))}

//           <Link
//             href="/hot-deals"
//             onClick={() => setIsMobileMenuOpen(false)}
//             className="flex justify-between items-center group py-2 mt-4"
//           >
//             <span className="text-[11px] font-bold tracking-widest uppercase text-red-600 group-hover:opacity-70 transition-opacity duration-300">
//               Sale
//             </span>
//           </Link>
//         </div>

//         {/* Footer */}
//         <div className="px-6 pb-10 pt-8 shrink-0 flex flex-col gap-6 bg-white border-t border-gray-200">
//           <div className="flex flex-col gap-4">
//             <a
//               href="#"
//               className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-foreground transition-colors"
//             >
//               <Instagram className="w-3.5 h-3.5" strokeWidth={1.5} /> Instagram
//             </a>
//             <a
//               href="#"
//               className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-foreground transition-colors"
//             >
//               <Facebook className="w-3.5 h-3.5" strokeWidth={1.5} /> Facebook
//             </a>
//           </div>

//           <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
//               Currency
//             </span>
//             <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
//               NGN (₦)
//             </span>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
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
  LogOut,
  Package,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/app/(general)/components/ProductCard"; // Adjust path if needed
import OptionModal from "@/app/(general)/components/OptionsModal"; // Adjust path if needed
import { searchProducts } from "@/app/actions/general/search";

const BASE_NAV_LINKS = [
  { name: "Shop", href: "/" },
  { name: "Collections", href: "/collections" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const { totalItems, toggleCart, addItem } = useCart();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  // --- UI STATES ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- OPTION MODAL STATES (For Quick Add from Search) ---
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [selectedRelatedProduct, setSelectedRelatedProduct] = useState<
    any | null
  >(null);

  // Prevent scrolling when mobile menu OR search is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  // --- DEBOUNCED SEARCH EFFECT ---
  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const res = await searchProducts(searchQuery);
      if (res.success) {
        setSearchResults(res.products);
      }
      setIsSearching(false);
    };

    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // --- CLOSING HANDLERS ---
  const handleMobileClose = () => setIsMobileMenuOpen(false);
  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  // --- QUICK ADD HANDLERS FOR SEARCH RESULTS ---
  const handleQuickAdd = useCallback(
    (item: any) => {
      if (item.hasVariants) {
        setSelectedRelatedProduct(item);
        setIsOptionModalOpen(true);
      } else {
        addItem({
          productId: item.id,
          name: item.name,
          price: item.discountPrice || item.basePrice,
          image: item.images[0] || "/placeholder.png",
          quantity: 1,
          maxStock: item.stock,
        });
        toggleCart();
        setIsSearchOpen(false);
      }
    },
    [addItem, toggleCart],
  );

  const handleModalAddToCart = useCallback(
    (
      modalProduct: any,
      variantId: string,
      qty: number,
      variantPrice: number,
      variantImage?: string,
    ) => {
      const variant = modalProduct.variants?.find(
        (v: any) => v.id === variantId,
      );
      addItem({
        productId: modalProduct.id,
        variantId,
        name: modalProduct.name,
        variantName: variant
          ? `${variant.color || ""} ${variant.size || ""}`.trim()
          : undefined,
        price: variantPrice,
        image: variantImage || modalProduct.images[0] || "/placeholder.png",
        quantity: qty,
        maxStock: variant?.stock || 0,
      });
      setIsOptionModalOpen(false);
      setIsSearchOpen(false);
      toggleCart();
    },
    [addItem, toggleCart],
  );

  return (
    <>
      <OptionModal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        product={selectedRelatedProduct}
        onAddToCart={handleModalAddToCart}
      />

      {/* ==========================================
          ANNOUNCEMENT BAR 
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
          MAIN NAVBAR
          ========================================== */}
      <nav className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md text-foreground border-b border-gray-200 mx-auto py-4 uppercase tracking-wide text-xs font-medium font-sans transition-colors duration-300">
        <div className="container-main mx-auto flex justify-between items-center w-full px-5 md:px-12 relative z-50">
          {/* LEFT: Mobile (Menu + Search) / Desktop (Links) */}
          <div className="flex items-center justify-start w-1/3 gap-4 md:gap-8">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-foreground hover:text-gray-500 transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden text-foreground hover:text-gray-500 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <div className="hidden md:flex items-center space-x-8">
              {BASE_NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="hover:text-gray-500 transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* CENTER: Logo */}
          <div className="w-1/3 flex justify-center items-center">
            <Link
              href="/"
              onClick={handleSearchClose}
              className="font-display text-xl md:text-2xl font-bold tracking-widest text-foreground"
            >
              GENTS
            </Link>
          </div>

          {/* RIGHT: Mobile (User + Cart) / Desktop (Utilities) */}
          <div className="flex items-center justify-end w-1/3 gap-4 md:gap-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex hover:text-gray-500 transition-colors duration-200 items-center gap-1"
            >
              <Search className="h-4 w-4" strokeWidth={1.5} />
              <span className="sr-only lg:not-sr-only">Search</span>
            </button>

            <Link
              href={isAuthenticated ? "/account/user" : "/account/login"}
              className="md:hidden text-foreground hover:text-gray-500 transition-colors"
              aria-label="Account"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>

            {/* Desktop Account Dropdown */}
            <div className="relative group py-2 hidden md:block">
              <Link
                href={isAuthenticated ? "/account/user" : "/account/login"}
                className="hover:text-gray-500 transition-colors duration-200 flex items-center gap-1"
              >
                <User className="h-4 w-4" strokeWidth={1.5} />
                <span className="sr-only lg:not-sr-only">
                  {status === "loading"
                    ? "..."
                    : isAuthenticated
                      ? "Account"
                      : "Sign In"}
                </span>
              </Link>

              {isAuthenticated && (
                <div className="absolute top-full right-0 mt-0 w-48 bg-white border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl flex flex-col z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-[9px] text-muted tracking-widest uppercase">
                      Logged in as
                    </p>
                    <p className="text-[10px] font-bold truncate tracking-widest mt-1">
                      {session?.user?.name || "User"}
                    </p>
                  </div>
                  <Link
                    href="/account/user"
                    className="px-4 py-3 text-[10px] uppercase tracking-widest hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Link>
                  <Link
                    href="/account/orders"
                    className="px-4 py-3 text-[10px] uppercase tracking-widest hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5" /> My Orders
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-left px-4 py-3 text-[10px] uppercase tracking-widest hover:bg-gray-50 text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                handleSearchClose();
                toggleCart();
              }}
              className="relative hover:text-gray-500 transition-colors duration-200 flex items-center gap-1 group"
              aria-label="Bag"
            >
              <div className="relative">
                <ShoppingBag
                  className="h-5 w-5 md:h-4 md:w-4"
                  strokeWidth={1.5}
                />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] text-background font-bold">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline-block ml-1">Bag</span>
            </button>
          </div>
        </div>

        {/* ==========================================
            FULL-WIDTH SEARCH DROPDOWN
            ========================================== */}
        <div
          className={`absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col z-40 ${
            isSearchOpen
              ? "max-h-[85vh] opacity-100 border-t"
              : "max-h-0 opacity-0 border-t-0 overflow-hidden"
          }`}
        >
          {/* Search Input Area */}
          <div className="px-5 md:px-12 py-6 border-b border-gray-100 relative flex items-center gap-4">
            <Search className="w-5 h-5 text-muted shrink-0" strokeWidth={1.5} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="SEARCH PRODUCTS, CATEGORIES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm md:text-base font-bold uppercase tracking-widest placeholder:text-gray-300 focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-muted hover:text-foreground transition-colors shrink-0"
              >
                <span className="text-[9px] font-bold uppercase tracking-widest mr-1">
                  Clear
                </span>
              </button>
            )}
            <button
              onClick={handleSearchClose}
              className="p-2 -mr-2 text-foreground hover:opacity-70 transition-opacity shrink-0 border-l border-gray-200 pl-4 ml-2"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </div>

          {/* Search Results Area */}
          <div className="px-5 md:px-12 py-8 overflow-y-auto max-h-[60vh] hide-scrollbar">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted">
                <Loader2 className="w-6 h-6 animate-spin mb-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Searching...
                </span>
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <div className="flex justify-between items-end mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                    Results for "{searchQuery}"
                  </span>
                  <Link
                    href={`/collections/products/all?q=${searchQuery}`}
                    onClick={handleSearchClose}
                    className="text-[9px] font-bold uppercase tracking-widest hover:text-muted transition-colors border-b border-foreground pb-0.5"
                  >
                    View All
                  </Link>{" "}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {searchResults.map((product) => (
                    <ProductCard
                      key={product.id}
                      item={product}
                      onQuickAdd={handleQuickAdd}
                      badgeLabel={
                        product.isNewArrival
                          ? "New"
                          : product.isHotDeal
                            ? "Sale"
                            : undefined
                      }
                      badgeColor={
                        product.isHotDeal ? "bg-red-600" : "bg-foreground"
                      }
                    />
                  ))}
                </div>
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted">
                <Search className="w-6 h-6 mb-4 opacity-50" strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  No products found
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Type at least 2 characters to search
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Backdrop for Search Dropdown */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[35] transition-opacity duration-500 ${
          isSearchOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handleSearchClose}
      />

      {/* ==========================================
          MOBILE SLIDE-OUT MENU
          ========================================== */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] transition-opacity duration-500 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handleMobileClose}
      />

      <div
        className={`fixed top-0 left-0 h-[100dvh] w-[85vw] max-w-[320px] bg-[#FAFAFA] text-foreground z-[60] flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] md:hidden shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center py-6 px-6 shrink-0 border-b border-gray-200 bg-white">
          <span className="font-display font-bold tracking-widest text-sm uppercase">
            Menu
          </span>
          <button
            onClick={handleMobileClose}
            className="p-1 -mr-2 text-foreground hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col hide-scrollbar">
          {/* Core Links */}
          <div className="flex flex-col mb-8">
            {BASE_NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={handleMobileClose}
                className="flex justify-between items-center group py-3 border-b border-gray-100"
              >
                <span className="text-[11px] font-bold tracking-widest uppercase text-foreground group-hover:text-gray-500 transition-colors duration-300">
                  {link.name}
                </span>
                <ArrowRight
                  className="w-3.5 h-3.5 text-gray-300 group-hover:text-foreground transition-colors duration-300"
                  strokeWidth={1.5}
                />
              </Link>
            ))}
            <Link
              href="/hot-deals"
              onClick={handleMobileClose}
              className="flex justify-between items-center group py-3 border-b border-gray-100"
            >
              <span className="text-[11px] font-bold tracking-widest uppercase text-red-600">
                Sale
              </span>
              <ArrowRight
                className="w-3.5 h-3.5 text-gray-300"
                strokeWidth={1.5}
              />
            </Link>
          </div>

          {/* MOBILE: Account Section */}
          <div className="flex flex-col">
            <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
              {isAuthenticated ? "My Account" : "Welcome"}
            </span>

            {isAuthenticated ? (
              <div className="flex flex-col bg-white border border-gray-200 rounded-sm">
                <Link
                  href="/account/user"
                  onClick={handleMobileClose}
                  className="flex items-center gap-3 py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <LayoutDashboard
                    className="w-4 h-4 text-muted"
                    strokeWidth={1.5}
                  />
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    Dashboard
                  </span>
                </Link>
                <Link
                  href="/account/orders"
                  onClick={handleMobileClose}
                  className="flex items-center gap-3 py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <Package className="w-4 h-4 text-muted" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    My Orders
                  </span>
                </Link>
                <button
                  onClick={() => {
                    handleMobileClose();
                    signOut();
                  }}
                  className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors text-left text-red-600"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    Sign Out
                  </span>
                </button>
              </div>
            ) : (
              <Link
                href="/account/login"
                onClick={handleMobileClose}
                className="flex justify-between items-center group py-3 border-b border-gray-100"
              >
                <span className="text-[11px] font-bold tracking-widest uppercase text-foreground">
                  Sign In / Register
                </span>
                <User className="w-3.5 h-3.5 text-gray-300" strokeWidth={1.5} />
              </Link>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-10 pt-6 shrink-0 flex flex-col gap-6 bg-white border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-gray-400 hover:text-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" strokeWidth={1.5} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-foreground transition-colors"
              >
                <Facebook className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                Currency
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">
                NGN
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
