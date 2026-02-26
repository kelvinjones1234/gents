// "use client";

// import { 
//   Truck, 
//   ShieldCheck, 
//   Minus, 
//   Plus, 
//   ChevronDown, 
//   ChevronUp, 
//   Star 
// } from "lucide-react";
// import { useState, useRef, useEffect } from "react";

// // --- DUMMY DATA ---
// const PRODUCT = {
//   id: "p_123",
//   name: "The Stealth Bomber Jacket",
//   category: "Outerwear",
//   basePrice: 145000,
//   discountPrice: 125000,
//   rating: 4.8,
//   reviews: 124,
//   description: "Engineered for the urban commute. Water-resistant, completely matte black, and crafted for maximum utility without compromising on clean minimalist lines. Features military-grade hardware and internal hidden compartments.",
//   images: [
//     "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1200",
//     "https://images.unsplash.com/photo-1520975954732-57dd22299614?auto=format&fit=crop&q=80&w=1200",
//     "https://images.unsplash.com/photo-1550614000-4b95d4ebf089?auto=format&fit=crop&q=80&w=1200",
//     "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1200",
//   ],
//   colors: [
//     { name: "Matte Black", hex: "#1A1A1A" },
//     { name: "Ash Grey", hex: "#5c5c5c" }
//   ],
//   sizes: ["S", "M", "L", "XL", "XXL"],
//   details: [
//     { title: "Materials & Care", content: "Outer: 100% Recycled Nylon. Lining: 100% Polyester. Machine wash cold, do not tumble dry. Avoid ironing directly on hardware." },
//     { title: "Shipping & Returns", content: "Free shipping on orders over ₦100,000. Delivery within 3-5 business days. 30-day return policy for unworn items with original tags attached." },
//     { title: "Warranty", content: "Backed by our 2-Year durability guarantee. We will repair or replace any manufacturing defects." }
//   ]
// };

// const RELATED_PRODUCTS = [
//   { id: "1", name: "Utility Cargo Pants", category: "Bottoms", price: 85000, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600" },
//   { id: "2", name: "Tactical Crossbody", category: "Accessories", price: 45000, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600" },
//   { id: "3", name: "Heavyweight Box Tee", category: "Tops", price: 35000, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600" },
//   { id: "4", name: "Combat Boots", category: "Footwear", price: 115000, image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600" },
// ];

// // --- ACCORDION COMPONENT ---
// const Accordion = ({ title, content, isOpen, onClick }: { title: string, content: string, isOpen: boolean, onClick: () => void }) => (
//   <div className="border-b border-gray-200 py-3 sm:py-4">
//     <button 
//       onClick={onClick}
//       className="w-full flex justify-between items-center text-left focus:outline-none group"
//     >
//       <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-foreground group-hover:text-gray-500 transition-colors pr-4">
//         {title}
//       </span>
//       {isOpen ? <ChevronUp className="w-4 h-4 text-muted flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />}
//     </button>
//     <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-60 opacity-100 mt-3 sm:mt-4" : "max-h-0 opacity-0"}`}>
//       <p className="text-[11px] sm:text-xs text-muted leading-relaxed pb-2">{content}</p>
//     </div>
//   </div>
// );

// // --- MAIN PDP COMPONENT ---
// export default function ProductDetails() {
//   const [selectedColor, setSelectedColor] = useState(PRODUCT.colors[0].name);
//   const [selectedSize, setSelectedSize] = useState(PRODUCT.sizes[1]);
//   const [quantity, setQuantity] = useState(1);
//   const [openAccordion, setOpenAccordion] = useState<string | null>(PRODUCT.details[0].title);
  
//   // State for mobile image slider tracking
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const scrollContainerRef = useRef<HTMLDivElement>(null);

//   // Handle scroll tracking for mobile image dots/counter
//   const handleScroll = () => {
//     if (scrollContainerRef.current) {
//       const scrollPosition = scrollContainerRef.current.scrollLeft;
//       const width = scrollContainerRef.current.offsetWidth;
//       const currentIndex = Math.round(scrollPosition / width);
//       setCurrentImageIndex(currentIndex);
//     }
//   };

//   const handleAddToCart = () => {
//     // Replace with your actual cart logic
//     alert(`Added ${quantity}x ${PRODUCT.name} (${selectedColor}, Size ${selectedSize}) to cart.`);
//   };

//   return (
//     <div className="bg-background text-foreground font-sans antialiased selection:bg-black selection:text-white pb-12">
      
//       {/* BREADCRUMBS (Scrollable on mobile) */}
//       <div className="border-b border-gray-200">
//         <div className="container-main mx-auto px-4 sm:px-6 md:px-12 py-3 sm:py-4 overflow-x-auto hide-scrollbar">
//           <nav className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-2 whitespace-nowrap min-w-max">
//             <a href="/" className="hover:text-foreground transition-colors">Home</a>
//             <span>/</span>
//             <a href="/collections/outerwear" className="hover:text-foreground transition-colors">{PRODUCT.category}</a>
//             <span>/</span>
//             <span className="text-foreground truncate">{PRODUCT.name}</span>
//           </nav>
//         </div>
//       </div>

//       {/* MAIN PRODUCT SECTION */}
//       <section className="container-main mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-12 lg:py-16">
//         <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-24 relative">
          
//           {/* LEFT: IMAGE GALLERY */}
//           <div className="w-full lg:w-[60%] flex flex-col gap-4 relative">
            
//             {/* Mobile Image Scroll with Snap */}
//             <div className="relative block lg:hidden w-full overflow-hidden bg-[#EFEFEF]">
//               <div 
//                 ref={scrollContainerRef}
//                 onScroll={handleScroll}
//                 className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full"
//               >
//                 {PRODUCT.images.map((img, i) => (
//                   <div key={i} className="min-w-full w-full snap-center relative aspect-[4/5]">
//                     <img src={img} alt={`${PRODUCT.name} ${i + 1}`} className="w-full h-full object-cover absolute inset-0" />
//                   </div>
//                 ))}
//               </div>
              
//               {/* Mobile Image Counter Badge */}
//               <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold tracking-widest z-10">
//                 {currentImageIndex + 1} / {PRODUCT.images.length}
//               </div>
//             </div>

//             {/* Desktop Image Stack */}
//             <div className="hidden lg:flex flex-col gap-6">
//               {PRODUCT.images.map((img, i) => (
//                 <div key={i} className="w-full bg-[#EFEFEF]">
//                   <img src={img} alt={`${PRODUCT.name} ${i + 1}`} className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700" />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* RIGHT: PRODUCT INFO (Sticky on desktop) */}
//           <div className="w-full lg:w-[40%]">
//             <div className="sticky top-24 flex flex-col space-y-6 sm:space-y-8">
              
//               {/* Title & Price */}
//               <div className="space-y-3 sm:space-y-4">
//                 <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
//                   <span className="bg-red-600 text-white px-2 py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">Sale</span>
//                   <span className="bg-foreground text-white px-2 py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">Bestseller</span>
//                 </div>
                
//                 <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium tracking-tight uppercase leading-[0.95] sm:leading-[0.9]">
//                   {PRODUCT.name}
//                 </h1>
                
//                 <div className="flex flex-wrap items-center gap-3 sm:gap-4">
//                   <p className="text-xl sm:text-2xl font-medium text-foreground tabular-nums">₦{PRODUCT.discountPrice.toLocaleString()}</p>
//                   <p className="text-base sm:text-lg text-gray-400 line-through tabular-nums">₦{PRODUCT.basePrice.toLocaleString()}</p>
//                 </div>
                
//                 <div className="flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-widest text-muted">
//                   <div className="flex text-black">
//                     {[...Array(5)].map((_, i) => (
//                       <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-black' : 'fill-transparent'}`} />
//                     ))}
//                   </div>
//                   <span>{PRODUCT.rating} ({PRODUCT.reviews})</span>
//                 </div>
//               </div>

//               {/* Description */}
//               <p className="text-xs sm:text-sm text-muted leading-relaxed">
//                 {PRODUCT.description}
//               </p>

//               {/* Color Selector */}
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Color</span>
//                   <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted">{selectedColor}</span>
//                 </div>
//                 <div className="flex gap-3">
//                   {PRODUCT.colors.map(color => (
//                     <button
//                       key={color.name}
//                       onClick={() => setSelectedColor(color.name)}
//                       className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300 ${selectedColor === color.name ? 'border-foreground p-1' : 'border-transparent'}`}
//                       aria-label={`Select ${color.name}`}
//                     >
//                       <span className="w-full h-full block rounded-full border border-gray-200" style={{ backgroundColor: color.hex }}></span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Size Selector (Responsive Wrap) */}
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Size</span>
//                   <button className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted underline hover:text-foreground transition-colors">Size Guide</button>
//                 </div>
//                 <div className="flex flex-wrap gap-2 sm:gap-3">
//                   {PRODUCT.sizes.map(size => (
//                     <button
//                       key={size}
//                       onClick={() => setSelectedSize(size)}
//                       className={`flex-1 min-w-[3.5rem] sm:min-w-[4rem] py-3 text-[10px] font-bold uppercase tracking-widest border transition-colors duration-300 text-center ${
//                         selectedSize === size 
//                           ? 'bg-foreground text-white border-foreground' 
//                           : 'bg-transparent text-foreground border-gray-200 hover:border-foreground'
//                       }`}
//                     >
//                       {size}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Quantity & Add to Cart */}
//               <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
//                 <div className="flex gap-2 sm:gap-4 h-12 sm:h-14">
//                   {/* Quantity (Slightly narrower on mobile) */}
//                   <div className="flex items-center justify-between border border-gray-200 w-24 sm:w-32 px-3 sm:px-4 text-foreground shrink-0">
//                     <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-gray-400 transition-colors py-2">
//                       <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
//                     </button>
//                     <span className="text-[11px] sm:text-xs font-bold tabular-nums">{quantity}</span>
//                     <button onClick={() => setQuantity(quantity + 1)} className="hover:text-gray-400 transition-colors py-2">
//                       <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
//                     </button>
//                   </div>
                  
//                   {/* Add to Cart Button */}
//                   <button 
//                     onClick={handleAddToCart}
//                     className="flex-1 bg-foreground text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-black transition-colors duration-300"
//                   >
//                     Add to Cart
//                   </button>
//                 </div>
                
//                 <button className="w-full h-12 sm:h-14 border border-foreground text-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-foreground hover:text-white transition-colors duration-300">
//                   Buy It Now
//                 </button>
//               </div>

//               {/* Trust Badges */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-5 sm:py-6 border-y border-gray-200">
//                 <div className="flex items-center gap-3">
//                   <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-muted shrink-0" />
//                   <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted">Free Global Shipping</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-muted shrink-0" />
//                   <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted">2-Year Warranty</span>
//                 </div>
//               </div>

//               {/* Accordions */}
//               <div className="pb-8 lg:pb-0">
//                 {PRODUCT.details.map((detail, index) => (
//                   <Accordion 
//                     key={index}
//                     title={detail.title}
//                     content={detail.content}
//                     isOpen={openAccordion === detail.title}
//                     onClick={() => setOpenAccordion(openAccordion === detail.title ? null : detail.title)}
//                   />
//                 ))}
//               </div>

//             </div>
//           </div>
//         </div>
//       </section>

//       {/* RELATED PRODUCTS SECTION */}
//       <section className="py-12 sm:py-16 md:py-24 bg-[#FAFAFA] border-t border-gray-200">
//         <div className="container-main mx-auto px-4 sm:px-6 md:px-12">
//           <div className="flex justify-between items-end mb-8 sm:mb-12">
//             <div>
//               <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted mb-1 sm:mb-2">Complete The Look</h2>
//               <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight uppercase">You May Also Like</h3>
//             </div>
//           </div>

//           <div className="flex overflow-x-auto gap-3 sm:gap-4 md:gap-6 hide-scrollbar pb-8 snap-x">
//             {RELATED_PRODUCTS.map((item) => (
//               <div key={item.id} className="min-w-[200px] sm:min-w-[240px] md:min-w-[280px] w-full max-w-[280px] snap-start group cursor-pointer flex flex-col">
//                 <div className="aspect-[4/5] w-full bg-[#EFEFEF] relative overflow-hidden border border-gray-100">
//                   <div className="absolute inset-0 flex items-center justify-center bg-[#EFEFEF] transition-colors duration-500 group-hover:bg-[#E5E5E5]">
//                     <img
//                       src={item.image}
//                       alt={item.name}
//                       className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
//                       loading="lazy"
//                     />
//                   </div>
//                   <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:translate-y-0">
//                     <button className="w-full bg-foreground/95 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:bg-black">
//                       Quick View
//                     </button>
//                   </div>
//                 </div>
//                 <div className="mt-4 sm:mt-6 flex flex-col items-center text-center space-y-1 sm:space-y-1.5 px-2">
//                   <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-foreground leading-relaxed line-clamp-1">
//                     {item.name}
//                   </h3>
//                   <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted">
//                     {item.category}
//                   </p>
//                   <p className="text-[10px] sm:text-[11px] font-bold tracking-wide tabular-nums text-foreground mt-1">
//                     ₦{item.price.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//     </div>
//   );
// }





"use client";

import { 
  Truck, 
  ShieldCheck, 
  Minus, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Star 
} from "lucide-react";
import { useState, useRef } from "react";

// --- DUMMY DATA ---
const PRODUCT = {
  id: "p_123",
  name: "The Stealth Bomber Jacket",
  category: "Outerwear",
  basePrice: 145000,
  discountPrice: 125000,
  rating: 4.8,
  reviews: 124,
  description: "Engineered for the urban commute. Water-resistant, completely matte black, and crafted for maximum utility without compromising on clean minimalist lines. Features military-grade hardware and internal hidden compartments.",
  images: [
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1520975954732-57dd22299614?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1550614000-4b95d4ebf089?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1200",
  ],
  colors: [
    { name: "Matte Black", hex: "#1A1A1A" },
    { name: "Ash Grey", hex: "#5c5c5c" }
  ],
  sizes: ["S", "M", "L", "XL", "XXL"],
  details: [
    { title: "Materials & Care", content: "Outer: 100% Recycled Nylon. Lining: 100% Polyester. Machine wash cold, do not tumble dry. Avoid ironing directly on hardware." },
    { title: "Shipping & Returns", content: "Free shipping on orders over ₦100,000. Delivery within 3-5 business days. 30-day return policy for unworn items with original tags attached." },
    { title: "Warranty", content: "Backed by our 2-Year durability guarantee. We will repair or replace any manufacturing defects." }
  ]
};

const RELATED_PRODUCTS = [
  { id: "1", name: "Utility Cargo Pants", category: "Bottoms", price: 85000, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600" },
  { id: "2", name: "Tactical Crossbody", category: "Accessories", price: 45000, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600" },
  { id: "3", name: "Heavyweight Box Tee", category: "Tops", price: 35000, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600" },
  { id: "4", name: "Combat Boots", category: "Footwear", price: 115000, image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600" },
];

// --- ACCORDION COMPONENT ---
const Accordion = ({ title, content, isOpen, onClick }: { title: string, content: string, isOpen: boolean, onClick: () => void }) => (
  <div className="border-b border-gray-200 py-3 sm:py-4">
    <button 
      onClick={onClick}
      className="w-full flex justify-between items-center text-left focus:outline-none group"
    >
      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-foreground group-hover:text-gray-500 transition-colors pr-4">
        {title}
      </span>
      {isOpen ? <ChevronUp className="w-4 h-4 text-muted flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />}
    </button>
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-60 opacity-100 mt-3 sm:mt-4" : "max-h-0 opacity-0"}`}>
      <p className="text-[11px] sm:text-xs text-muted leading-relaxed pb-2">{content}</p>
    </div>
  </div>
);

// --- STICKY MOBILE CTA BAR ---
const StickyMobileCTA = ({ onAddToCart, onBuyNow }: { onAddToCart: () => void, onBuyNow: () => void }) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 px-4 py-3 flex gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
    <button
      onClick={onAddToCart}
      className="flex-1 h-12 border border-foreground text-foreground text-[9px] font-bold uppercase tracking-[0.15em] hover:bg-foreground hover:text-white transition-colors duration-300"
    >
      Add to Cart
    </button>
    <button
      onClick={onBuyNow}
      className="flex-1 h-12 bg-foreground text-white text-[9px] font-bold uppercase tracking-[0.15em] hover:bg-black transition-colors duration-300"
    >
      Buy It Now
    </button>
  </div>
);

// --- MAIN PDP COMPONENT ---
export default function ProductDetails() {
  const [selectedColor, setSelectedColor] = useState(PRODUCT.colors[0].name);
  const [selectedSize, setSelectedSize] = useState(PRODUCT.sizes[1]);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>(PRODUCT.details[0].title);
  
  // Image Slider State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollPosition = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      const currentIndex = Math.round(scrollPosition / width);
      setCurrentImageIndex(currentIndex);
    }
  };

  const scrollToImage = (index: number) => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({ left: index * width, behavior: "smooth" });
    }
  };

  const scrollPrev = () => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollBy({ left: -width, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollBy({ left: width, behavior: 'smooth' });
    }
  };

  const handleAddToCart = () => {
    alert(`Added ${quantity}x ${PRODUCT.name} (${selectedColor}, Size ${selectedSize}) to cart.`);
  };

  const handleBuyNow = () => {
    alert(`Buying now: ${quantity}x ${PRODUCT.name} (${selectedColor}, Size ${selectedSize})`);
  };

  return (
    <div className="bg-background text-foreground font-sans antialiased selection:bg-black selection:text-white pb-20 lg:pb-12">
      
      {/* BREADCRUMBS */}
      <div className="border-b border-gray-200">
        <div className="container-main mx-auto px-4 sm:px-6 md:px-12 py-3 sm:py-4 overflow-x-auto hide-scrollbar">
          <nav className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-2 whitespace-nowrap min-w-max">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <span>/</span>
            <a href="/collections/outerwear" className="hover:text-foreground transition-colors">{PRODUCT.category}</a>
            <span>/</span>
            <span className="text-foreground truncate">{PRODUCT.name}</span>
          </nav>
        </div>
      </div>

      {/* MAIN PRODUCT SECTION */}
      <section className="container-main mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-24 relative">
          
          {/* LEFT: IMAGE GALLERY (Unified Responsive Slider) */}
          <div className="w-full lg:w-[60%] relative group">
            <div className="relative w-full overflow-hidden bg-[#EFEFEF]">
              
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full"
              >
                {PRODUCT.images.map((img, i) => (
                  <div key={i} className="min-w-full w-full snap-center relative aspect-[4/5] lg:aspect-[3/4]">
                    <img src={img} alt={`${PRODUCT.name} ${i + 1}`} className="w-full h-full object-cover absolute inset-0" />
                  </div>
                ))}
              </div>

              {/* Desktop Arrow Navigation */}
              <button 
                onClick={scrollPrev}
                disabled={currentImageIndex === 0}
                className="hidden lg:flex absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 disabled:opacity-0 shadow-sm"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button 
                onClick={scrollNext}
                disabled={currentImageIndex === PRODUCT.images.length - 1}
                className="hidden lg:flex absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 disabled:opacity-0 shadow-sm"
                aria-label="Next Image"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
              
              {/* Dot Navigation */}
              <div className="absolute bottom-4 lg:bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10">
                {PRODUCT.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToImage(i)}
                    aria-label={`Go to image ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentImageIndex === i ? "w-5 bg-foreground" : "w-1.5 bg-white/70 hover:bg-white"
                    }`}
                  />
                ))}
              </div>

              {/* Counter Badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold tracking-widest z-10">
                {currentImageIndex + 1} / {PRODUCT.images.length}
              </div>

            </div>
          </div>

          {/* RIGHT: PRODUCT INFO */}
          <div className="w-full lg:w-[40%]">
            <div className="sticky top-24 flex flex-col space-y-6 sm:space-y-8">
              
              {/* Title & Price */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <span className="bg-red-600 text-white px-2 py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">Sale</span>
                  <span className="bg-foreground text-white px-2 py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">Bestseller</span>
                </div>
                
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium tracking-tight uppercase leading-[0.95] sm:leading-[0.9]">
                  {PRODUCT.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <p className="text-xl sm:text-2xl font-medium text-foreground tabular-nums">₦{PRODUCT.discountPrice.toLocaleString()}</p>
                  <p className="text-base sm:text-lg text-gray-400 line-through tabular-nums">₦{PRODUCT.basePrice.toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-widest text-muted">
                  <div className="flex text-black">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-black' : 'fill-transparent'}`} />
                    ))}
                  </div>
                  <span>{PRODUCT.rating} ({PRODUCT.reviews})</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {PRODUCT.description}
              </p>

              {/* Color Selector */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Color</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted">{selectedColor}</span>
                </div>
                <div className="flex gap-3">
                  {PRODUCT.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300 ${selectedColor === color.name ? 'border-foreground p-1' : 'border-transparent'}`}
                      aria-label={`Select ${color.name}`}
                    >
                      <span className="w-full h-full block rounded-full border border-gray-200" style={{ backgroundColor: color.hex }}></span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Size</span>
                  <button className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted underline hover:text-foreground transition-colors">Size Guide</button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {PRODUCT.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-[10px] font-bold uppercase tracking-widest border transition-colors duration-300 text-center ${
                        selectedSize === size 
                          ? 'bg-foreground text-white border-foreground' 
                          : 'bg-transparent text-foreground border-gray-200 hover:border-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart — Desktop Only */}
              <div className="hidden lg:block space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                <div className="flex gap-2 sm:gap-4 h-12 sm:h-14">
                  <div className="flex items-center justify-between border border-gray-200 w-24 sm:w-32 px-3 sm:px-4 text-foreground shrink-0">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-gray-400 transition-colors py-2">
                      <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <span className="text-[11px] sm:text-xs font-bold tabular-nums">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="hover:text-gray-400 transition-colors py-2">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-foreground text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-black transition-colors duration-300"
                  >
                    Add to Cart
                  </button>
                </div>
                <button
                  onClick={handleBuyNow}
                  className="w-full h-12 sm:h-14 border border-foreground text-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-foreground hover:text-white transition-colors duration-300"
                >
                  Buy It Now
                </button>
              </div>

              {/* Mobile Quantity Editor */}
              <div className="lg:hidden space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest">Qty</span>
                  <div className="flex items-center justify-between border border-gray-200 w-28 px-4 h-11 text-foreground">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-gray-400 transition-colors py-2">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] font-bold tabular-nums">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="hover:text-gray-400 transition-colors py-2">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-5 sm:py-6 border-y border-gray-200">
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-muted shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted">Free Global Shipping</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-muted shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted">2-Year Warranty</span>
                </div>
              </div>

              {/* Accordions */}
              <div className="pb-8 lg:pb-0">
                {PRODUCT.details.map((detail, index) => (
                  <Accordion 
                    key={index}
                    title={detail.title}
                    content={detail.content}
                    isOpen={openAccordion === detail.title}
                    onClick={() => setOpenAccordion(openAccordion === detail.title ? null : detail.title)}
                  />
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS SECTION */}
      <section className="py-12 sm:py-16 md:py-24 bg-[#FAFAFA] border-t border-gray-200">
        <div className="container-main mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex justify-between items-end mb-8 sm:mb-12">
            <div>
              <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted mb-1 sm:mb-2">Complete The Look</h2>
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight uppercase">You May Also Like</h3>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-3 sm:gap-4 md:gap-6 hide-scrollbar pb-8 snap-x">
            {RELATED_PRODUCTS.map((item) => (
              <div key={item.id} className="min-w-[160px] xs:min-w-[200px] sm:min-w-[240px] md:min-w-[280px] w-full max-w-[280px] snap-start group cursor-pointer flex flex-col">
                <div className="aspect-[4/5] w-full bg-[#EFEFEF] relative overflow-hidden border border-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center bg-[#EFEFEF] transition-colors duration-500 group-hover:bg-[#E5E5E5]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:translate-y-0">
                    <button className="w-full bg-foreground/95 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:bg-black">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 flex flex-col items-center text-center space-y-1 sm:space-y-1.5 px-2">
                  <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-foreground leading-relaxed line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted">
                    {item.category}
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-bold tracking-wide tabular-nums text-foreground mt-1">
                    ₦{item.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STICKY MOBILE CTA BAR */}
      <StickyMobileCTA onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
    </div>
  );
}