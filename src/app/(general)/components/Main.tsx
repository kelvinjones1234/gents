// "use client";

// import { Truck, Recycle, ShieldCheck, Instagram, Loader2 } from "lucide-react";
// import {
//   useState,
//   useEffect,
//   useMemo,
//   useTransition,
//   useCallback,
//   memo,
// } from "react";
// import { Product, Category, ProductVariant } from "@prisma/client";
// import { getProductsByCategory } from "@/app/actions/general/storefront";
// import Link from "next/link";
// import OptionModal from "./OptionsModal";
// import { useCart } from "@/context/CartContext";

// // --- Types ---
// type ProductWithRelations = Product & {
//   categories: Category[];
//   variants: ProductVariant[];
// };

// type CategoryWithCount = Category & {
//   _count: { products: number };
// };

// interface MainProps {
//   newArrivals: ProductWithRelations[];
//   hotDeals: ProductWithRelations[];
//   featuredProducts: ProductWithRelations[];
//   topSellers: ProductWithRelations[];
//   featuredCategories: Category[];
//   allCategories: CategoryWithCount[];
// }

// // --- EXTRACTED & MEMOIZED CARD COMPONENT ---
// // Moving this outside the main component prevents it from being re-created
// // on every render (which was causing the image blinking).
// const ProductCard = memo(
//   ({
//     item,
//     badgeLabel,
//     badgeColor = "bg-foreground",
//     onQuickAdd,
//   }: {
//     item: ProductWithRelations;
//     badgeLabel?: string;
//     badgeColor?: string;
//     onQuickAdd: (item: ProductWithRelations) => void;
//   }) => {
//     const totalStock =
//       item.hasVariants && item.variants
//         ? item.variants.reduce((sum, v) => sum + v.stock, 0)
//         : item.stock;
//     const isSoldOut = totalStock <= 0;

//     return (
//       <div className="min-w-[240px] sm:min-w-[280px] md:min-w-[340px] w-full max-w-[340px] snap-start group cursor-pointer flex flex-col transform-gpu">
//         <div className="aspect-[4/5] w-full bg-[#EFEFEF] relative overflow-hidden border border-gray-100">
//           {/* Status Badges */}
//           {isSoldOut ? (
//             <div className="absolute top-4 left-4 z-20 pointer-events-none">
//               <span className="bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-foreground shadow-sm">
//                 Sold Out
//               </span>
//             </div>
//           ) : (
//             badgeLabel && (
//               <div className="absolute top-4 left-4 z-20 pointer-events-none">
//                 <span
//                   className={`${badgeColor} text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-sm`}
//                 >
//                   {badgeLabel}
//                 </span>
//               </div>
//             )
//           )}

//           {/* Product Image - Optimized */}
//           <div className="absolute inset-0 flex items-center justify-center p-8 bg-[#EFEFEF] transition-colors duration-500 group-hover:bg-[#E5E5E5]">
//             <img
//               src={item.images[0] || "/placeholder.png"}
//               alt={item.name}
//               className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform ${
//                 isSoldOut ? "opacity-50 grayscale" : ""
//               }`}
//               loading="lazy"
//               decoding="async" // Helps prevent UI blocking
//             />
//           </div>

//           {/* Quick Add Overlay - Optimized Animation */}
//           {!isSoldOut && (
//             <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-full transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-transform group-hover:translate-y-0">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onQuickAdd(item);
//                 }}
//                 className="w-full bg-foreground/95 py-4 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:bg-black"
//               >
//                 {item.hasVariants ? "Select Options" : "Quick Add"}
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Product Details */}
//         <div className="mt-6 flex flex-col items-center text-center space-y-1.5 px-2">
//           <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground leading-relaxed line-clamp-2">
//             {item.name}
//           </h3>
//           <p className="text-[10px] uppercase tracking-widest text-muted">
//             {item.categories?.[0]?.name || "Collection"}
//           </p>
//           <div className="flex items-center gap-2 mt-1">
//             {item.discountPrice ? (
//               <>
//                 <p className="text-[11px] font-bold tracking-wide tabular-nums text-gray-400 line-through">
//                   ₦{item.basePrice.toLocaleString()}
//                 </p>
//                 <p className="text-[11px] font-bold tracking-wide tabular-nums text-red-600">
//                   ₦{item.discountPrice.toLocaleString()}
//                 </p>
//               </>
//             ) : (
//               <p className="text-[11px] font-bold tracking-wide tabular-nums text-foreground">
//                 ₦{item.basePrice.toLocaleString()}
//               </p>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   },
// );
// // Add display name for debugging
// ProductCard.displayName = "ProductCard";

// export default function Main({
//   newArrivals,
//   hotDeals,
//   featuredProducts,
//   topSellers,
//   featuredCategories,
//   allCategories,
// }: MainProps) {
//   // --- HOOKS ---
//   const { addItem, toggleCart } = useCart();

//   const [activeTab, setActiveTab] = useState("All");
//   const [displayedProducts, setDisplayedProducts] =
//     useState<ProductWithRelations[]>(featuredProducts);
//   const [isPending, startTransition] = useTransition();

//   // --- MODAL STATE ---
//   const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
//   const [selectedProductForModal, setSelectedProductForModal] =
//     useState<ProductWithRelations | null>(null);

//   // --- CART HANDLERS (OPTIMIZED) ---

//   // Memoized to prevent re-creation on every render
//   const handleQuickAdd = useCallback(
//     (product: ProductWithRelations) => {
//       if (product.hasVariants) {
//         setSelectedProductForModal(product);
//         setIsOptionModalOpen(true);
//       } else {
//         const price = product.discountPrice ?? product.basePrice;

//         addItem({
//           productId: product.id,
//           name: product.name,
//           price: price,
//           originalPrice: product.discountPrice ? product.basePrice : undefined,
//           image: product.images[0] || "/placeholder.png",
//           quantity: 1,
//           maxStock: product.stock,
//         });

//         toggleCart();
//       }
//     },
//     [addItem, toggleCart],
//   );

//   const handleModalAddToCart = useCallback(
//     (
//       product: ProductWithRelations,
//       variantId: string,
//       quantity: number,
//       variantPrice: number,
//       variantImage?: string,
//     ) => {
//       const variant = product.variants.find((v) => v.id === variantId);
//       const variantName = variant
//         ? `${variant.color || ""} ${variant.size || ""}`.trim()
//         : undefined;

//       addItem({
//         productId: product.id,
//         variantId: variantId,
//         name: product.name,
//         variantName: variantName,
//         price: variantPrice,
//         image: variantImage || product.images[0],
//         quantity: quantity,
//         maxStock: variant?.stock || 0,
//       });

//       setIsOptionModalOpen(false);
//       toggleCart();
//     },
//     [addItem, toggleCart],
//   );

//   // --- DYNAMIC TABS LOGIC ---
//   const tabs = useMemo(() => {
//     return [{ id: "All", name: "All", slug: "all" }, ...featuredCategories];
//   }, [featuredCategories]);

//   const handleTabChange = (tabId: string) => {
//     setActiveTab(tabId);
//     startTransition(async () => {
//       const products = await getProductsByCategory(tabId);
//       // @ts-ignore
//       setDisplayedProducts(products as ProductWithRelations[]);
//     });
//   };

//   // --- ANIMATION & LAYOUT LOGIC ---
//   // Note: This logic was causing the re-renders that made images blink
//   const [isAnimating, setIsAnimating] = useState(false);
//   const originalFeatures = useMemo(
//     () => [
//       {
//         id: 0,
//         icon: Recycle,
//         title: "Eco-Friendly",
//         desc: "Made from recycled PET bottles and sustainable materials.",
//       },
//       {
//         id: 1,
//         icon: Truck,
//         title: "Free Shipping",
//         desc: "Complimentary global shipping on all orders over ₦100,000.",
//       },
//       {
//         id: 2,
//         icon: ShieldCheck,
//         title: "2-Year Warranty",
//         desc: "We stand behind our durability. Repair or replace guaranteed.",
//       },
//     ],
//     [],
//   );

//   const [features, setFeatures] = useState(originalFeatures);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setIsAnimating(true);
//       setTimeout(() => {
//         setFeatures((prev) => [...prev.slice(1), prev[0]]);
//         setIsAnimating(false);
//       }, 500);
//     }, 3500);
//     return () => clearInterval(timer);
//   }, []);

//   const leftCategories = allCategories.slice(0, 3);
//   const rightCategories = allCategories.slice(3, 6);

//   return (
//     <div className="bg-background text-foreground font-sans antialiased transition-colors duration-300">
//       {/* 0. OPTION MODAL */}
//       <OptionModal
//         isOpen={isOptionModalOpen}
//         onClose={() => setIsOptionModalOpen(false)}
//         product={selectedProductForModal}
//         // @ts-ignore
//         onAddToCart={handleModalAddToCart}
//       />

//       <section className="relative w-full h-[60vh] md:h-[90vh] bg-gradient-to-tr from-[#2F3A39] via-[#434B49] to-[#70675B] overflow-hidden flex items-center">
//         {/* Background Image */}
//         <div className="absolute inset-0 z-0 pointer-events-none">
//           <img
//             src="/img3.png"
//             alt="Fall Collection Model"
//             // 1. object-contain keeps your exact scale.
//             // 2. object-bottom pins the feet to the bottom (removes the empty space).
//             // 3. translate-x-0 keeps it centered on mobile.
//             // 4. md:translate-x-32 applies your exact right-shift ONLY on large screens.
//             className="w-full h-full object-contain object-bottom translate-x-32 md:translate-x-32"
//             decoding="async"
//           />
//         </div>

//         {/* Content */}
//         <div className="container-main mx-auto relative z-10 w-full flex flex-col justify-center h-full px-6 md:px-12">
//           <h1 className="text-white font-display text-[14vw] md:text-[12vw] lg:text-[9vw] leading-[0.9] font-bold tracking-tight uppercase max-w-[80%] mix-blend-overlay">
//             /Gents
//             <br />
//             Collec — Tion
//             <br />
//             2026
//           </h1>

//           <div className="absolute bottom-12 right-6 md:right-12 text-right text-white text-[10px] md:text-xs tracking-widest uppercase font-medium space-y-1 hidden sm:block">
//             {allCategories.slice(0, 5).map((c) => (
//               <p key={c.id}>{c.name}</p>
//             ))}
//           </div>

//           <div className="mt-8 flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest cursor-pointer group self-start">
//             <span className="h-2 w-2 bg-white group-hover:scale-150 transition-transform duration-300"></span>
//             <span className="border-b border-transparent group-hover:border-white transition-colors duration-300">
//               Explore Now
//             </span>
//           </div>
//         </div>
//       </section>

//       {/* 2. CORE VALUES */}
//       <section className="py-8 bg-[#FAFAFA] border-b border-gray-200 overflow-hidden relative">
//         <div className="container-main mx-auto px-6 md:px-12">
//           <div className="hidden md:grid grid-cols-3 gap-8 text-left">
//             {originalFeatures.map((feature) => {
//               const Icon = feature.icon;
//               return (
//                 <div
//                   key={feature.id}
//                   className="flex flex-col items-start gap-3"
//                 >
//                   <Icon className="w-5 h-5 text-muted" />
//                   <div>
//                     <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground mb-1">
//                       {feature.title}
//                     </h4>
//                     <p className="text-xs text-muted leading-relaxed">
//                       {feature.desc}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//           <div className="md:hidden block overflow-hidden">
//             <div
//               className={`flex w-full ${isAnimating ? "transition-transform duration-500 ease-in-out -translate-x-full" : "translate-x-0"}`}
//             >
//               {features.map((feature) => {
//                 const Icon = feature.icon;
//                 return (
//                   <div
//                     key={feature.id}
//                     className="w-full flex-shrink-0 flex flex-col items-center gap-3 text-center"
//                   >
//                     <Icon className="w-5 h-5 text-muted" />
//                     <div>
//                       <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground mb-1">
//                         {feature.title}
//                       </h4>
//                       <p className="text-xs text-muted leading-relaxed max-w-[250px] mx-auto">
//                         {feature.desc}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 3. CATEGORIES SECTION */}
//       <section className="py-16 bg-white overflow-hidden border-b border-gray-200">
//         <div className="container-main mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-8 lg:gap-12">
//           <div className="w-full md:w-[40%] flex flex-col items-center md:items-end justify-center gap-4 md:gap-10 order-1 z-10">
//             {leftCategories.map((cat, i) => (
//               <a
//                 key={cat.id}
//                 href={`/collections/${cat.slug}`}
//                 className={`group flex items-start transition-transform duration-300 hover:scale-105 ${i === 1 ? "md:mr-10 lg:mr-16" : ""}`}
//               >
//                 <span
//                   className={`font-display text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-[60px] font-medium pb-1 tracking-tight transition-all duration-500 text-transparent [-webkit-text-stroke:1px_#D1D1D1] md:text-[#A3A3A3] md:[-webkit-text-stroke:0] group-hover:text-black group-hover:[-webkit-text-stroke:0]`}
//                 >
//                   {cat.name.toUpperCase()}
//                 </span>
//                 <sup
//                   className={`text-[10px] sm:text-xs font-medium ml-1 mt-2 md:mt-3 transition-colors duration-300 ${
//                     i === 0
//                       ? "text-black/40"
//                       : "text-[#CECECE] group-hover:text-black/60"
//                   }`}
//                 >
//                   {cat._count.products}
//                 </sup>
//               </a>
//             ))}
//           </div>

//           <div className="w-full md:w-[40%] flex flex-col items-center md:items-start justify-center gap-4 md:gap-10 order-2 md:order-3 z-10 md:mt-8">
//             {rightCategories.map((cat, i) => (
//               <a
//                 key={cat.id}
//                 href={`/collections/${cat.slug}`}
//                 className={`group flex items-start transition-transform duration-300 hover:scale-105 ${i === 1 ? "md:ml-10 lg:ml-16" : ""}`}
//               >
//                 <span className="font-display text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-[60px] font-medium pb-1 tracking-tight text-transparent [-webkit-text-stroke:1px_#D1D1D1] md:text-[#A3A3A3] md:[-webkit-text-stroke:0] group-hover:text-black group-hover:[-webkit-text-stroke:0] transition-all duration-500">
//                   {cat.name.toUpperCase()}
//                 </span>
//                 <sup className="text-[10px] sm:text-xs font-medium ml-1 mt-2 md:mt-3 text-[#CECECE] group-hover:text-black/60 transition-colors duration-300">
//                   {cat._count.products}
//                 </sup>
//               </a>
//             ))}
//           </div>
//         </div>
//         <div className="mt-8 container-main mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-200 pt-8">
//           <p className="text-xs text-muted max-w-sm leading-relaxed text-center md:text-start">
//             A hand-selected selection of the best selling products in our online
//             store. Discover the favorite pieces of our community.
//           </p>
//           <a
//             href="/all-products"
//             className="px-10 py-4 border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors duration-300"
//           >
//             View All Products
//           </a>
//         </div>
//       </section>

//       {/* 4. NEW ARRIVALS */}
//       <section className="py-16 bg-[#FAFAFA] border-b border-gray-200">
//         <div className="container-main mx-auto px-6 md:px-12 flex justify-between items-center mb-12">
//           <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
//             New Arrivals
//           </h2>
//           <div className="flex gap-4">
//             <Link
//               href="/new-arrivals"
//               className="px-6 py-3 border border-gray-200 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:border-foreground hover:bg-foreground hover:text-white transition-all duration-300 ease-in-out"
//             >
//               More
//             </Link>
//           </div>
//         </div>
//         <div className="flex overflow-x-auto gap-4 md:gap-6 hide-scrollbar pb-12 snap-x px-6 md:px-12">
//           {newArrivals.map((item) => (
//             <ProductCard
//               key={item.id}
//               item={item}
//               badgeLabel="New"
//               onQuickAdd={handleQuickAdd}
//             />
//           ))}
//         </div>
//       </section>

//       {/* 5. GADGETS SPOTLIGHT */}
//       <section className="py-16 bg-white border-b border-gray-200">
//         <div className="container-main mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-24 items-center">
//           <div className="order-1 aspect-[4/5] overflow-hidden bg-[#FAFAFA] relative">
//             <div className="absolute inset-0 bg-gray-100 mix-blend-multiply transition-colors duration-500 hover:bg-transparent z-10 pointer-events-none"></div>
//             <img
//               src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
//               alt="Headphones"
//               className="w-full h-full object-cover hover:scale-105 transition-all duration-1000"
//               loading="lazy"
//               decoding="async"
//             />
//           </div>
//           <div className="order-2 space-y-6 md:space-y-8">
//             <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted">
//               Tech Spotlight
//             </h2>
//             <h3 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.9] tracking-tight text-foreground">
//               SOUND
//               <br />
//               WITHOUT
//               <br />
//               LIMITS
//             </h3>
//             <p className="text-sm text-muted leading-relaxed max-w-md">
//               Elevate your auditory experience. Our curated selection of premium
//               audio gadgets marries high-fidelity sound with minimalist, robust
//               industrial design.
//             </p>
//             <div className="flex items-center gap-3 text-foreground text-xs font-bold uppercase tracking-widest cursor-pointer group self-start">
//               <span className="h-2 w-2 bg-foreground group-hover:scale-150 transition-transform duration-300"></span>
//               <span className="border-b border-transparent group-hover:border-foreground transition-colors duration-300">
//                 Explore Audio
//               </span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 6. TOP SELLERS */}
//       <section className="py-16 bg-[#FAFAFA] border-b border-gray-200">
//         <div className="container-main mx-auto px-6 md:px-12 flex justify-between items-center mb-12">
//           <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
//             Trending Now
//           </h2>
//           <div className="flex gap-4">
//             <Link
//               href="/collections/new-arrivals"
//               className="px-6 py-3 border border-gray-200 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:border-foreground hover:bg-foreground hover:text-white transition-all duration-300 ease-in-out"
//             >
//               More
//             </Link>
//           </div>
//         </div>
//         <div className="flex overflow-x-auto gap-4 md:gap-6 hide-scrollbar pb-12 snap-x px-6 md:px-12">
//           {topSellers.map((item) => (
//             <ProductCard
//               key={item.id}
//               item={item}
//               onQuickAdd={handleQuickAdd}
//             />
//           ))}
//         </div>
//       </section>

//       {/* 7. EDC SPOTLIGHT */}
//       <section className="py-16 bg-white border-b border-gray-200">
//         <div className="container-main mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-24 items-center">
//           <div className="order-1 md:order-2 aspect-[4/5] overflow-hidden bg-[#FAFAFA] relative">
//             <div className="absolute inset-0 bg-gray-100 mix-blend-multiply transition-colors duration-500 hover:bg-transparent z-10 pointer-events-none"></div>
//             <img
//               src="/img1.png"
//               alt="EDC"
//               className="w-full h-full object-cover hover:scale-105 transition-all duration-1000"
//               decoding="async"
//             />
//           </div>
//           <div className="order-2 md:order-1 space-y-6 md:space-y-8">
//             <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted">
//               Everyday Carry
//             </h2>
//             <h3 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.9] tracking-tight text-foreground">
//               TOOLS
//               <br />
//               OF THE
//               <br />
//               TRADE
//             </h3>
//             <p className="text-sm text-muted leading-relaxed max-w-md">
//               From precision-machined pocket knives to carbon steel grooming
//               shears. We source the finest hardware designed to last a lifetime
//               and assist in your daily rituals.
//             </p>
//             <div className="flex items-center gap-3 text-foreground text-xs font-bold uppercase tracking-widest cursor-pointer group self-start">
//               <span className="h-2 w-2 bg-foreground group-hover:scale-150 transition-transform duration-300"></span>
//               <span className="border-b border-transparent group-hover:border-foreground transition-colors duration-300">
//                 Explore Hardware
//               </span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 8. HOT DEALS */}
//       <section className="py-16 bg-[#FAFAFA] border-b border-gray-200">
//         <div className="container-main mx-auto px-6 md:px-12 flex justify-between items-center mb-12">
//           <h2 className="text-xs font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
//             <span className="w-2 h-2 bg-red-600 animate-pulse"></span>
//             Flash Sale
//           </h2>
//           <div className="flex gap-4">
//             <Link
//               href="/hot-deals"
//               className="px-6 py-3 border border-gray-200 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:border-foreground hover:bg-foreground hover:text-white transition-all duration-300 ease-in-out"
//             >
//               More
//             </Link>
//           </div>
//         </div>
//         <div className="flex overflow-x-auto gap-4 md:gap-6 hide-scrollbar pb-12 snap-x px-6 md:px-12">
//           {hotDeals.map((item) => (
//             <ProductCard
//               key={item.id}
//               item={item}
//               badgeLabel="SALE"
//               badgeColor="bg-red-600"
//               onQuickAdd={handleQuickAdd}
//             />
//           ))}
//         </div>
//       </section>

//       {/* 9. CAMPAIGN */}
//       <section className="py-24 bg-foreground text-white border-b border-gray-800">
//         <div className="container-main mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-24 items-center">
//           <div className="order-1 md:order-2 aspect-[4/5] overflow-hidden bg-gray-800">
//             <img
//               src="/img1.png"
//               alt="Stealth Series"
//               className="w-full h-full object-cover opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-1000"
//               decoding="async"
//             />
//           </div>
//           <div className="order-2 md:order-1 space-y-6 md:space-y-8">
//             <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
//               Campaign
//             </h2>
//             <h3 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.9] tracking-tight">
//               THE
//               <br />
//               STEALTH
//               <br />
//               SERIES
//             </h3>
//             <p className="text-sm text-gray-400 leading-relaxed max-w-md">
//               Engineered for the urban commute. Water-resistant, completely
//               matte black, and crafted for maximum utility without compromising
//               on clean minimalist lines.
//             </p>
//             <div className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest cursor-pointer group self-start">
//               <span className="h-2 w-2 bg-white group-hover:scale-150 transition-transform duration-300"></span>
//               <span className="border-b border-transparent group-hover:border-white transition-colors duration-300 pb-0.5">
//                 Shop The Series
//               </span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 10. FEATURED COLLECTIONS */}
//       <section className="py-16 bg-white border-b border-gray-200 min-h-[500px]">
//         <div className="container-main mx-auto px-6 md:px-12">
//           <div className="flex flex-col items-center mb-16">
//             <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight uppercase mb-10 text-foreground text-center">
//               Featured Collections
//             </h2>
//             <div className="flex overflow-x-auto hide-scrollbar gap-6 md:gap-12 pb-1 max-w-full">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => handleTabChange(tab.id)}
//                   disabled={isPending}
//                   className={`flex-shrink-0 text-[10px] md:text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all duration-300 ${
//                     activeTab === tab.id
//                       ? "text-foreground border-foreground"
//                       : "text-muted border-transparent hover:text-foreground hover:border-gray-300"
//                   } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
//                 >
//                   {tab.name}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="relative">
//           {isPending && (
//             <div className="absolute inset-0 bg-white/60 z-50 flex items-start justify-center pt-20">
//               <Loader2 className="w-8 h-8 animate-spin text-foreground" />
//             </div>
//           )}

//           <div className="flex overflow-x-auto gap-4 md:gap-6 hide-scrollbar pb-12 snap-x px-6 md:px-12">
//             {displayedProducts.length === 0 ? (
//               <div className="w-full text-center py-12 text-muted text-xs uppercase tracking-widest">
//                 No featured items available in this category.
//               </div>
//             ) : (
//               displayedProducts.map((item) => (
//                 <ProductCard
//                   key={item.id}
//                   item={item}
//                   badgeLabel={item.isNewArrival ? "New" : undefined}
//                   onQuickAdd={handleQuickAdd}
//                 />
//               ))
//             )}
//           </div>
//         </div>

//         <div className="mt-8 container-main mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-200 pt-8">
//           <p className="text-xs text-muted max-w-sm leading-relaxed text-center md:text-start">
//             A hand-selected selection of the best selling products in our online
//             store. Discover the favorite pieces of our community.
//           </p>
//           <a
//             href="/collections/all"
//             className="px-10 py-4 border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors duration-300"
//           >
//             View All Products
//           </a>
//         </div>
//       </section>

//       {/* 11. THE BRAND & 12. COLLABORATIONS & 13. SOCIAL & 14. NEWSLETTER */}
//       <div className="py-16 bg-white border-b border-gray-200">
//         <div className="container-main mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-8 md:gap-24 lg:gap-32">
//           <div className="md:w-1/4">
//             <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
//               The Brand
//             </h3>
//           </div>
//           <div className="md:w-3/4 max-w-5xl">
//             <p className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-display font-medium leading-[1.2] text-muted uppercase tracking-tight">
//               We unite a passion for premium design with a{" "}
//               <span className="text-foreground transition-colors duration-300 hover:text-[#5E7472] cursor-default">
//                 modern lifestyle mindset
//               </span>
//               . We stand for durable apparel and tools that{" "}
//               <span className="text-foreground transition-colors duration-300 hover:text-[#5E7472] cursor-default">
//                 go beyond seasons
//               </span>
//               . Instead of following fleeting trends, we focus on{" "}
//               <span className="text-foreground transition-colors duration-300 hover:text-[#5E7472] cursor-default">
//                 timeless silhouettes
//               </span>
//               .
//             </p>
//           </div>
//         </div>
//       </div>

//       <section className="py-16 bg-[#FAFAFA] border-b border-gray-200">
//         <div className="container-main mx-auto px-6 md:px-12">
//           <h2 className="text-xs font-bold uppercase tracking-widest mb-12 md:mb-24 text-foreground">
//             Collaborations
//           </h2>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32">
//             <div className="flex flex-col justify-between">
//               <div className="space-y-6 md:space-y-8">
//                 <h3 className="font-display text-2xl md:text-4xl font-medium leading-[0.9] tracking-tight">
//                   <span className="font-light text-muted">/</span>BRAUN AUDIO
//                   <sup className="text-xs font-normal text-muted align-top ml-4 tracking-normal">
//                     2025
//                   </sup>
//                 </h3>
//                 <p className="text-sm text-muted leading-relaxed max-w-sm">
//                   With a shared passion for lifestyle, architecture, and sound,
//                   the partnership brings together heritage design and modern
//                   engineering for the ultimate home listening experience.
//                 </p>
//                 <div className="pt-4">
//                   <button className="px-8 py-4 border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors duration-300">
//                     Learn More
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <div className="space-y-12">
//               <div className="flex gap-4 h-[260px] sm:h-[340px] md:h-[450px]">
//                 <div className="flex-1 overflow-hidden bg-gray-200">
//                   <img
//                     alt="Collab Lifestyle 1"
//                     className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
//                     src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800"
//                     decoding="async"
//                   />
//                 </div>
//                 <div className="flex-1 overflow-hidden bg-gray-200">
//                   <img
//                     alt="Collab Lifestyle 2"
//                     className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
//                     src="https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&q=80&w=800"
//                     decoding="async"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="py-16 bg-white overflow-hidden">
//         <div className="container-main mx-auto px-6 md:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
//           <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-3">
//             <Instagram className="w-4 h-4" /> @GentsCollection
//           </h2>
//           <a
//             href="#"
//             className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5"
//           >
//             Follow Us On Instagram
//           </a>
//         </div>
//         <div className="flex gap-2 overflow-x-auto hide-scrollbar">
//           {[
//             "1617137911089-4c1170f6b4e6",
//             "1503341455253-b2e723bb3dbb",
//             "1492707892639-74e2013f9661",
//             "1550614000-4b95d4ebf089",
//             "1503342394128-c104d54dba01",
//           ].map((img, i) => (
//             <div
//               key={i}
//               className="min-w-[180px] sm:min-w-[240px] md:min-w-[300px] aspect-square flex-shrink-0 group relative cursor-pointer overflow-hidden bg-gray-100"
//             >
//               <img
//                 src={`https://images.unsplash.com/photo-${img}?auto=format&fit=crop&q=80&w=600`}
//                 alt="Social Feed"
//                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
//                 loading="lazy"
//                 decoding="async"
//               />
//               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
//                 <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-110" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       <section className="py-24 md:py-32 bg-[#FAFAFA] border-t border-gray-200">
//         <div className="container-main mx-auto px-6 md:px-12 max-w-2xl text-center space-y-8">
//           <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight uppercase">
//             Join the Journey
//           </h2>
//           <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
//             Subscribe to our newsletter to receive updates on new arrivals,
//             exclusive collaborations, and insights into our lifestyle curations.
//           </p>
//           <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full pt-4">
//             <input
//               type="email"
//               placeholder="YOUR EMAIL ADDRESS"
//               className="flex-1 px-6 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
//               required
//             />
//             <button
//               type="submit"
//               className="px-8 py-4 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 whitespace-nowrap"
//             >
//               Subscribe
//             </button>
//           </form>
//         </div>
//       </section>
//     </div>
//   );
// }









"use client";

import { Truck, Recycle, ShieldCheck, Instagram, Loader2 } from "lucide-react";
import {
  useState,
  useEffect,
  useMemo,
  useTransition,
  useCallback,
} from "react";
import { Product, Category, ProductVariant } from "@prisma/client";
import { getProductsByCategory } from "@/app/actions/general/storefront";
import Link from "next/link";
import OptionModal from "./OptionsModal";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "./ProductCard";

// --- Types ---
type ProductWithRelations = Product & {
  categories: Category[];
  variants: ProductVariant[];
};

type CategoryWithCount = Category & {
  _count: { products: number };
};

interface MainProps {
  newArrivals: ProductWithRelations[];
  hotDeals: ProductWithRelations[];
  featuredProducts: ProductWithRelations[];
  topSellers: ProductWithRelations[];
  featuredCategories: Category[];
  allCategories: CategoryWithCount[];
}

export default function Main({
  newArrivals,
  hotDeals,
  featuredProducts,
  topSellers,
  featuredCategories,
  allCategories,
}: MainProps) {
  // --- HOOKS ---
  const { addItem, toggleCart } = useCart();

  const [activeTab, setActiveTab] = useState("All");
  const [displayedProducts, setDisplayedProducts] =
    useState<ProductWithRelations[]>(featuredProducts);
  const [isPending, startTransition] = useTransition();

  // --- MODAL STATE ---
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] =
    useState<ProductWithRelations | null>(null);

  // --- CART HANDLERS (OPTIMIZED) ---

  // Memoized to prevent re-creation on every render
  const handleQuickAdd = useCallback(
    (product: ProductWithRelations) => {
      if (product.hasVariants) {
        setSelectedProductForModal(product);
        setIsOptionModalOpen(true);
      } else {
        const price = product.discountPrice ?? product.basePrice;

        addItem({
          productId: product.id,
          name: product.name,
          price: price,
          originalPrice: product.discountPrice ? product.basePrice : undefined,
          image: product.images[0] || "/placeholder.png",
          quantity: 1,
          maxStock: product.stock,
        });

        toggleCart();
      }
    },
    [addItem, toggleCart],
  );

  const handleModalAddToCart = useCallback(
    (
      product: ProductWithRelations,
      variantId: string,
      quantity: number,
      variantPrice: number,
      variantImage?: string,
    ) => {
      const variant = product.variants.find((v) => v.id === variantId);
      const variantName = variant
        ? `${variant.color || ""} ${variant.size || ""}`.trim()
        : undefined;

      addItem({
        productId: product.id,
        variantId: variantId,
        name: product.name,
        variantName: variantName,
        price: variantPrice,
        image: variantImage || product.images[0],
        quantity: quantity,
        maxStock: variant?.stock || 0,
      });

      setIsOptionModalOpen(false);
      toggleCart();
    },
    [addItem, toggleCart],
  );

  // --- DYNAMIC TABS LOGIC ---
  const tabs = useMemo(() => {
    return [{ id: "All", name: "All", slug: "all" }, ...featuredCategories];
  }, [featuredCategories]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    startTransition(async () => {
      const products = await getProductsByCategory(tabId);
      // @ts-ignore
      setDisplayedProducts(products as ProductWithRelations[]);
    });
  };

  // --- ANIMATION & LAYOUT LOGIC ---
  const [isAnimating, setIsAnimating] = useState(false);
  const originalFeatures = useMemo(
    () => [
      {
        id: 0,
        icon: Recycle,
        title: "Eco-Friendly",
        desc: "Made from recycled PET bottles and sustainable materials.",
      },
      {
        id: 1,
        icon: Truck,
        title: "Free Shipping",
        desc: "Complimentary global shipping on all orders over ₦100,000.",
      },
      {
        id: 2,
        icon: ShieldCheck,
        title: "2-Year Warranty",
        desc: "We stand behind our durability. Repair or replace guaranteed.",
      },
    ],
    [],
  );

  const [features, setFeatures] = useState(originalFeatures);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setFeatures((prev) => [...prev.slice(1), prev[0]]);
        setIsAnimating(false);
      }, 500);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const leftCategories = allCategories.slice(0, 3);
  const rightCategories = allCategories.slice(3, 6);

  return (
    <div className="bg-background text-foreground font-sans antialiased transition-colors duration-300">
      {/* 0. OPTION MODAL */}
      <OptionModal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        product={selectedProductForModal}
        // @ts-ignore
        onAddToCart={handleModalAddToCart}
      />

      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[60vh] md:h-[90vh] bg-gradient-to-tr from-[#2F3A39] via-[#434B49] to-[#70675B] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/img3.png"
            alt="Fall Collection Model"
            className="w-full h-full object-contain object-bottom translate-x-32 md:translate-x-32"
            decoding="async"
          />
        </div>

        <div className="container-main mx-auto relative z-10 w-full flex flex-col justify-center h-full px-6 md:px-12">
          <h1 className="text-white font-display text-[14vw] md:text-[12vw] lg:text-[9vw] leading-[0.9] font-bold tracking-tight uppercase max-w-[80%] mix-blend-overlay">
            /Gents
            <br />
            Collec — Tion
            <br />
            2026
          </h1>

          <div className="absolute bottom-12 right-6 md:right-12 text-right text-white text-[10px] md:text-xs tracking-widest uppercase font-medium space-y-1 hidden sm:block">
            {allCategories.slice(0, 5).map((c) => (
              <p key={c.id}>{c.name}</p>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest cursor-pointer group self-start">
            <span className="h-2 w-2 bg-white group-hover:scale-150 transition-transform duration-300"></span>
            <span className="border-b border-transparent group-hover:border-white transition-colors duration-300">
              Explore Now
            </span>
          </div>
        </div>
      </section>

      {/* 2. CORE VALUES */}
      <section className="py-8 bg-[#FAFAFA] border-b border-gray-200 overflow-hidden relative">
        <div className="container-main mx-auto px-6 md:px-12">
          <div className="hidden md:grid grid-cols-3 gap-8 text-left">
            {originalFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="flex flex-col items-start gap-3"
                >
                  <Icon className="w-5 h-5 text-muted" />
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="md:hidden block overflow-hidden">
            <div
              className={`flex w-full ${isAnimating ? "transition-transform duration-500 ease-in-out -translate-x-full" : "translate-x-0"}`}
            >
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="w-full flex-shrink-0 flex flex-col items-center gap-3 text-center"
                  >
                    <Icon className="w-5 h-5 text-muted" />
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-muted leading-relaxed max-w-[250px] mx-auto">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="py-16 bg-white overflow-hidden border-b border-gray-200">
        <div className="container-main mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-8 lg:gap-12">
          <div className="w-full md:w-[40%] flex flex-col items-center md:items-end justify-center gap-4 md:gap-10 order-1 z-10">
            {leftCategories.map((cat, i) => (
              <a
                key={cat.id}
                href={`/collections/${cat.slug}`}
                className={`group flex items-start transition-transform duration-300 hover:scale-105 ${i === 1 ? "md:mr-10 lg:mr-16" : ""}`}
              >
                <span
                  className={`font-display text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-[60px] font-medium pb-1 tracking-tight transition-all duration-500 text-transparent [-webkit-text-stroke:1px_#D1D1D1] md:text-[#A3A3A3] md:[-webkit-text-stroke:0] group-hover:text-black group-hover:[-webkit-text-stroke:0]`}
                >
                  {cat.name.toUpperCase()}
                </span>
                <sup
                  className={`text-[10px] sm:text-xs font-medium ml-1 mt-2 md:mt-3 transition-colors duration-300 ${
                    i === 0
                      ? "text-black/40"
                      : "text-[#CECECE] group-hover:text-black/60"
                  }`}
                >
                  {cat._count.products}
                </sup>
              </a>
            ))}
          </div>

          <div className="w-full md:w-[40%] flex flex-col items-center md:items-start justify-center gap-4 md:gap-10 order-2 md:order-3 z-10 md:mt-8">
            {rightCategories.map((cat, i) => (
              <a
                key={cat.id}
                href={`/collections/${cat.slug}`}
                className={`group flex items-start transition-transform duration-300 hover:scale-105 ${i === 1 ? "md:ml-10 lg:ml-16" : ""}`}
              >
                <span className="font-display text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-[60px] font-medium pb-1 tracking-tight text-transparent [-webkit-text-stroke:1px_#D1D1D1] md:text-[#A3A3A3] md:[-webkit-text-stroke:0] group-hover:text-black group-hover:[-webkit-text-stroke:0] transition-all duration-500">
                  {cat.name.toUpperCase()}
                </span>
                <sup className="text-[10px] sm:text-xs font-medium ml-1 mt-2 md:mt-3 text-[#CECECE] group-hover:text-black/60 transition-colors duration-300">
                  {cat._count.products}
                </sup>
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 container-main mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-200 pt-8">
          <p className="text-xs text-muted max-w-sm leading-relaxed text-center md:text-start">
            A hand-selected selection of the best selling products in our online
            store. Discover the favorite pieces of our community.
          </p>
          <a
            href="/all-products"
            className="px-10 py-4 border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors duration-300"
          >
            View All Products
          </a>
        </div>
      </section>

      {/* 4. NEW ARRIVALS */}
      <section className="py-16 bg-[#FAFAFA] border-b border-gray-200">
        <div className="container-main mx-auto px-6 md:px-12 flex justify-between items-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            New Arrivals
          </h2>
          <div className="flex gap-4">
            <Link
              href="/new-arrivals"
              className="px-6 py-3 border border-gray-200 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:border-foreground hover:bg-foreground hover:text-white transition-all duration-300 ease-in-out"
            >
              More
            </Link>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-4 md:gap-6 hide-scrollbar pb-12 snap-x px-6 md:px-12">
          {newArrivals.map((item) => (
            <div key={item.id} className="min-w-[160px] sm:min-w-[240px] md:min-w-[280px] shrink-0 snap-start">
              <ProductCard
                item={item}
                badgeLabel="New"
                onQuickAdd={handleQuickAdd}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5. GADGETS SPOTLIGHT */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="container-main mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-24 items-center">
          <div className="order-1 aspect-[4/5] overflow-hidden bg-[#FAFAFA] relative">
            <div className="absolute inset-0 bg-gray-100 mix-blend-multiply transition-colors duration-500 hover:bg-transparent z-10 pointer-events-none"></div>
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
              alt="Headphones"
              className="w-full h-full object-cover hover:scale-105 transition-all duration-1000"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="order-2 space-y-6 md:space-y-8">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted">
              Tech Spotlight
            </h2>
            <h3 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.9] tracking-tight text-foreground">
              SOUND
              <br />
              WITHOUT
              <br />
              LIMITS
            </h3>
            <p className="text-sm text-muted leading-relaxed max-w-md">
              Elevate your auditory experience. Our curated selection of premium
              audio gadgets marries high-fidelity sound with minimalist, robust
              industrial design.
            </p>
            <div className="flex items-center gap-3 text-foreground text-xs font-bold uppercase tracking-widest cursor-pointer group self-start">
              <span className="h-2 w-2 bg-foreground group-hover:scale-150 transition-transform duration-300"></span>
              <span className="border-b border-transparent group-hover:border-foreground transition-colors duration-300">
                Explore Audio
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TOP SELLERS */}
      <section className="py-16 bg-[#FAFAFA] border-b border-gray-200">
        <div className="container-main mx-auto px-6 md:px-12 flex justify-between items-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Trending Now
          </h2>
          <div className="flex gap-4">
            <Link
              href="/collections/new-arrivals"
              className="px-6 py-3 border border-gray-200 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:border-foreground hover:bg-foreground hover:text-white transition-all duration-300 ease-in-out"
            >
              More
            </Link>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-4 md:gap-6 hide-scrollbar pb-12 snap-x px-6 md:px-12">
          {topSellers.map((item) => (
            <div key={item.id} className="min-w-[160px] sm:min-w-[240px] md:min-w-[280px] shrink-0 snap-start">
              <ProductCard
                item={item}
                onQuickAdd={handleQuickAdd}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 7. EDC SPOTLIGHT */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="container-main mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-24 items-center">
          <div className="order-1 md:order-2 aspect-[4/5] overflow-hidden bg-[#FAFAFA] relative">
            <div className="absolute inset-0 bg-gray-100 mix-blend-multiply transition-colors duration-500 hover:bg-transparent z-10 pointer-events-none"></div>
            <img
              src="/img1.png"
              alt="EDC"
              className="w-full h-full object-cover hover:scale-105 transition-all duration-1000"
              decoding="async"
            />
          </div>
          <div className="order-2 md:order-1 space-y-6 md:space-y-8">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted">
              Everyday Carry
            </h2>
            <h3 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.9] tracking-tight text-foreground">
              TOOLS
              <br />
              OF THE
              <br />
              TRADE
            </h3>
            <p className="text-sm text-muted leading-relaxed max-w-md">
              From precision-machined pocket knives to carbon steel grooming
              shears. We source the finest hardware designed to last a lifetime
              and assist in your daily rituals.
            </p>
            <div className="flex items-center gap-3 text-foreground text-xs font-bold uppercase tracking-widest cursor-pointer group self-start">
              <span className="h-2 w-2 bg-foreground group-hover:scale-150 transition-transform duration-300"></span>
              <span className="border-b border-transparent group-hover:border-foreground transition-colors duration-300">
                Explore Hardware
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. HOT DEALS */}
      <section className="py-16 bg-[#FAFAFA] border-b border-gray-200">
        <div className="container-main mx-auto px-6 md:px-12 flex justify-between items-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 animate-pulse"></span>
            Flash Sale
          </h2>
          <div className="flex gap-4">
            <Link
              href="/hot-deals"
              className="px-6 py-3 border border-gray-200 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:border-foreground hover:bg-foreground hover:text-white transition-all duration-300 ease-in-out"
            >
              More
            </Link>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-4 md:gap-6 hide-scrollbar pb-12 snap-x px-6 md:px-12">
          {hotDeals.map((item) => (
            <div key={item.id} className="min-w-[160px] sm:min-w-[240px] md:min-w-[280px] shrink-0 snap-start">
              <ProductCard
                item={item}
                badgeLabel="SALE"
                badgeColor="bg-red-600"
                onQuickAdd={handleQuickAdd}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 9. CAMPAIGN */}
      <section className="py-24 bg-foreground text-white border-b border-gray-800">
        <div className="container-main mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-24 items-center">
          <div className="order-1 md:order-2 aspect-[4/5] overflow-hidden bg-gray-800">
            <img
              src="/img1.png"
              alt="Stealth Series"
              className="w-full h-full object-cover opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-1000"
              decoding="async"
            />
          </div>
          <div className="order-2 md:order-1 space-y-6 md:space-y-8">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Campaign
            </h2>
            <h3 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.9] tracking-tight">
              THE
              <br />
              STEALTH
              <br />
              SERIES
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              Engineered for the urban commute. Water-resistant, completely
              matte black, and crafted for maximum utility without compromising
              on clean minimalist lines.
            </p>
            <div className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-widest cursor-pointer group self-start">
              <span className="h-2 w-2 bg-white group-hover:scale-150 transition-transform duration-300"></span>
              <span className="border-b border-transparent group-hover:border-white transition-colors duration-300 pb-0.5">
                Shop The Series
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FEATURED COLLECTIONS */}
      <section className="py-16 bg-white border-b border-gray-200 min-h-[500px]">
        <div className="container-main mx-auto px-6 md:px-12">
          <div className="flex flex-col items-center mb-16">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight uppercase mb-10 text-foreground text-center">
              Featured Collections
            </h2>
            <div className="flex overflow-x-auto hide-scrollbar gap-6 md:gap-12 pb-1 max-w-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  disabled={isPending}
                  className={`flex-shrink-0 text-[10px] md:text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all duration-300 ${
                    activeTab === tab.id
                      ? "text-foreground border-foreground"
                      : "text-muted border-transparent hover:text-foreground hover:border-gray-300"
                  } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          {isPending && (
            <div className="absolute inset-0 bg-white/60 z-50 flex items-start justify-center pt-20">
              <Loader2 className="w-8 h-8 animate-spin text-foreground" />
            </div>
          )}

          <div className="flex overflow-x-auto gap-4 md:gap-6 hide-scrollbar pb-12 snap-x px-6 md:px-12">
            {displayedProducts.length === 0 ? (
              <div className="w-full text-center py-12 text-muted text-xs uppercase tracking-widest">
                No featured items available in this category.
              </div>
            ) : (
              displayedProducts.map((item) => (
                <div key={item.id} className="min-w-[160px] sm:min-w-[240px] md:min-w-[280px] shrink-0 snap-start">
                  <ProductCard
                    item={item}
                    badgeLabel={item.isNewArrival ? "New" : undefined}
                    onQuickAdd={handleQuickAdd}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 container-main mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-200 pt-8">
          <p className="text-xs text-muted max-w-sm leading-relaxed text-center md:text-start">
            A hand-selected selection of the best selling products in our online
            store. Discover the favorite pieces of our community.
          </p>
          <a
            href="/collections/all"
            className="px-10 py-4 border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors duration-300"
          >
            View All Products
          </a>
        </div>
      </section>

      {/* 11. THE BRAND & 12. COLLABORATIONS & 13. SOCIAL & 14. NEWSLETTER */}
      <div className="py-16 bg-white border-b border-gray-200">
        <div className="container-main mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-8 md:gap-24 lg:gap-32">
          <div className="md:w-1/4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
              The Brand
            </h3>
          </div>
          <div className="md:w-3/4 max-w-5xl">
            <p className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-display font-medium leading-[1.2] text-muted uppercase tracking-tight">
              We unite a passion for premium design with a{" "}
              <span className="text-foreground transition-colors duration-300 hover:text-[#5E7472] cursor-default">
                modern lifestyle mindset
              </span>
              . We stand for durable apparel and tools that{" "}
              <span className="text-foreground transition-colors duration-300 hover:text-[#5E7472] cursor-default">
                go beyond seasons
              </span>
              . Instead of following fleeting trends, we focus on{" "}
              <span className="text-foreground transition-colors duration-300 hover:text-[#5E7472] cursor-default">
                timeless silhouettes
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      <section className="py-16 bg-[#FAFAFA] border-b border-gray-200">
        <div className="container-main mx-auto px-6 md:px-12">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-12 md:mb-24 text-foreground">
            Collaborations
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32">
            <div className="flex flex-col justify-between">
              <div className="space-y-6 md:space-y-8">
                <h3 className="font-display text-2xl md:text-4xl font-medium leading-[0.9] tracking-tight">
                  <span className="font-light text-muted">/</span>BRAUN AUDIO
                  <sup className="text-xs font-normal text-muted align-top ml-4 tracking-normal">
                    2025
                  </sup>
                </h3>
                <p className="text-sm text-muted leading-relaxed max-w-sm">
                  With a shared passion for lifestyle, architecture, and sound,
                  the partnership brings together heritage design and modern
                  engineering for the ultimate home listening experience.
                </p>
                <div className="pt-4">
                  <button className="px-8 py-4 border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors duration-300">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-12">
              <div className="flex gap-4 h-[260px] sm:h-[340px] md:h-[450px]">
                <div className="flex-1 overflow-hidden bg-gray-200">
                  <img
                    alt="Collab Lifestyle 1"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                    src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800"
                    decoding="async"
                  />
                </div>
                <div className="flex-1 overflow-hidden bg-gray-200">
                  <img
                    alt="Collab Lifestyle 2"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                    src="https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&q=80&w=800"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white overflow-hidden">
        <div className="container-main mx-auto px-6 md:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-3">
            <Instagram className="w-4 h-4" /> @GentsCollection
          </h2>
          <a
            href="#"
            className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5"
          >
            Follow Us On Instagram
          </a>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {[
            "1617137911089-4c1170f6b4e6",
            "1503341455253-b2e723bb3dbb",
            "1492707892639-74e2013f9661",
            "1550614000-4b95d4ebf089",
            "1503342394128-c104d54dba01",
          ].map((img, i) => (
            <div
              key={i}
              className="min-w-[180px] sm:min-w-[240px] md:min-w-[300px] aspect-square flex-shrink-0 group relative cursor-pointer overflow-hidden bg-gray-100"
            >
              <img
                src={`https://images.unsplash.com/photo-${img}?auto=format&fit=crop&q=80&w=600`}
                alt="Social Feed"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-110" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-32 bg-[#FAFAFA] border-t border-gray-200">
        <div className="container-main mx-auto px-6 md:px-12 max-w-2xl text-center space-y-8">
          <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight uppercase">
            Join the Journey
          </h2>
          <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
            Subscribe to our newsletter to receive updates on new arrivals,
            exclusive collaborations, and insights into our lifestyle curations.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full pt-4">
            <input
              type="email"
              placeholder="YOUR EMAIL ADDRESS"
              className="flex-1 px-6 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}