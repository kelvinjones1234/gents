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
  Star,
} from "lucide-react";
import { useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductVariant, Category, Review } from "@prisma/client";
import { ProductCard } from "@/app/(general)/components/ProductCard";
import { useCart } from "@/context/CartContext";
import OptionModal from "@/app/(general)/components/OptionsModal";

// --- TYPES ---
export type FullProductDetails = Product & {
  variants: ProductVariant[];
  categories: Category[];
  reviews: (Review & { user?: { fullName: string } })[];
};

export type ProductWithRelations = Product & {
  categories: Category[];
  variants: ProductVariant[];
};

interface ProductDetailsProps {
  product: FullProductDetails;
  relatedProducts: ProductWithRelations[];
}

// --- ACCORDION COMPONENT ---
// (Kept exactly the same as your original)
const Accordion = ({
  title,
  content,
  isOpen,
  onClick,
}: {
  title: string;
  content: string;
  isOpen: boolean;
  onClick: () => void;
}) => (
  <div className="border-b border-gray-200 py-3 sm:py-4">
    <button
      onClick={onClick}
      className="w-full flex justify-between items-center text-left focus:outline-none group"
    >
      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-foreground group-hover:text-gray-500 transition-colors pr-4">
        {title}
      </span>
      {isOpen ? (
        <ChevronUp className="w-4 h-4 text-muted flex-shrink-0" />
      ) : (
        <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />
      )}
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-60 opacity-100 mt-3 sm:mt-4" : "max-h-0 opacity-0"}`}
    >
      <p className="text-[11px] sm:text-xs text-muted leading-relaxed pb-2">
        {content}
      </p>
    </div>
  </div>
);

// --- STICKY MOBILE CTA BAR ---
// (Kept exactly the same as your original)
const StickyMobileCTA = ({
  onAddToCart,
  onBuyNow,
  disabled,
}: {
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled: boolean;
}) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 px-4 py-3 flex gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
    <button
      onClick={onAddToCart}
      disabled={disabled}
      className="flex-1 h-12 border border-foreground text-foreground text-[9px] font-bold uppercase tracking-[0.15em] hover:bg-foreground hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Add to Cart
    </button>
    <button
      onClick={onBuyNow}
      disabled={disabled}
      className="flex-1 h-12 bg-foreground text-white text-[9px] font-bold uppercase tracking-[0.15em] hover:bg-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Buy It Now
    </button>
  </div>
);

// --- MAIN PDP COMPONENT ---
export default function Main({
  product,
  relatedProducts,
}: ProductDetailsProps) {
  const router = useRouter();
  const { addItem, toggleCart } = useCart();

  // Extract Dynamic Variants
  const availableColors = useMemo(
    () =>
      Array.from(
        new Set(product.variants.map((v) => v.color).filter(Boolean)),
      ) as string[],
    [product.variants],
  );
  const availableSizes = useMemo(
    () =>
      Array.from(
        new Set(product.variants.map((v) => v.size).filter(Boolean)),
      ) as string[],
    [product.variants],
  );

  const [selectedColor, setSelectedColor] = useState<string>(
    availableColors[0] || "",
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    availableSizes[0] || "",
  );
  const [quantity, setQuantity] = useState(1);

  // States for Related Products "Quick Add" Modal
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [selectedRelatedProduct, setSelectedRelatedProduct] =
    useState<ProductWithRelations | null>(null);

  // Static Details Fallback
  const defaultDetails = [
    {
      title: "Shipping & Returns",
      content:
        "Free shipping on orders over ₦100,000. Delivery within 3-5 business days. 30-day return policy for unworn items with original tags attached.",
    },
    {
      title: "Warranty",
      content:
        "Backed by our 2-Year durability guarantee. We will repair or replace any manufacturing defects.",
    },
  ];
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    defaultDetails[0].title,
  );

  // Image Slider State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Computed Values
  const categoryName = product.categories[0]?.name || "Uncategorized";
  const selectedVariant = product.hasVariants
    ? product.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize,
      )
    : null;

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.discountPrice || product.basePrice;
  const isOutOfStock = product.hasVariants
    ? selectedVariant?.stock === 0 || !selectedVariant
    : product.stock === 0;

  // Calculate Rating
  const averageRating =
    product.reviews.length > 0
      ? (
          product.reviews.reduce((acc, rev) => acc + rev.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : "0.0";

  // Slider Handlers
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollPosition = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      setCurrentImageIndex(Math.round(scrollPosition / width));
    }
  };

  const scrollToImage = (index: number) => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: index * width,
        behavior: "smooth",
      });
    }
  };

  const scrollPrev = () => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollBy({ left: -width, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollBy({ left: width, behavior: "smooth" });
    }
  };

  // --- ACTION HANDLERS ---

  // 1. Main Add to Cart
  const handleAddToCart = () => {
    if (product.hasVariants && !selectedVariant) {
      // Safety check in case states haven't initialized properly
      alert("Please select a color and size.");
      return;
    }

    const variantName = selectedVariant
      ? `${selectedVariant.color || ""} ${selectedVariant.size || ""}`.trim()
      : undefined;

    // Use variant image if it exists in your schema, otherwise fallback to main product image
    const itemImage = (selectedVariant as any)?.image || product.images[0] || "/placeholder.png";

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      variantName: variantName,
      price: currentPrice,
      image: itemImage,
      quantity: quantity,
      maxStock: selectedVariant ? selectedVariant.stock : product.stock,
    });

    toggleCart();
  };

  // 2. Buy It Now (Adds to cart & redirects to checkout)
  const handleBuyNow = () => {
    if (product.hasVariants && !selectedVariant) return;
    
    handleAddToCart();
    router.push("/checkout"); // Update this to your actual checkout route
  };

  // 3. Quick Add for Related Products
  const handleQuickAdd = useCallback(
    (item: ProductWithRelations) => {
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
      }
    },
    [addItem, toggleCart],
  );

  // 4. Modal Add To Cart for Related Products
  const handleModalAddToCart = useCallback(
    (
      modalProduct: any,
      variantId: string,
      qty: number,
      variantPrice: number,
      variantImage?: string,
    ) => {
      const variant = modalProduct.variants?.find((v: any) => v.id === variantId);
      const variantName = variant
        ? `${variant.color || ""} ${variant.size || ""}`.trim()
        : undefined;

      addItem({
        productId: modalProduct.id,
        variantId: variantId,
        name: modalProduct.name,
        variantName: variantName,
        price: variantPrice,
        image: variantImage || modalProduct.images[0] || "/placeholder.png",
        quantity: qty,
        maxStock: variant?.stock || 0,
      });

      setIsOptionModalOpen(false);
      toggleCart();
    },
    [addItem, toggleCart],
  );

  return (
    <div className="bg-background text-foreground font-sans antialiased selection:bg-black selection:text-white pb-20 lg:pb-12">
      
      {/* RELATED PRODUCTS OPTION MODAL */}
      <OptionModal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        product={selectedRelatedProduct}
        onAddToCart={handleModalAddToCart}
      />

      {/* BREADCRUMBS */}
      <div className="border-b border-gray-200">
        <div className="container-main mx-auto px-4 sm:px-6 md:px-12 py-3 sm:py-4 overflow-x-auto hide-scrollbar">
          <nav className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-2 whitespace-nowrap min-w-max">
            <a href="/" className="hover:text-foreground transition-colors">
              Home
            </a>
            <span>/</span>
            <a
              href={`/collections/${product.categories[0]?.slug || "all"}`}
              className="hover:text-foreground transition-colors"
            >
              {categoryName}
            </a>
            <span>/</span>
            <span className="text-foreground truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* MAIN PRODUCT SECTION */}
      <section className="container-main mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-24 relative">
          {/* LEFT: IMAGE GALLERY */}
          <div className="w-full lg:w-[60%] relative group">
            <div className="relative w-full overflow-hidden bg-[#EFEFEF]">
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full"
              >
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className="min-w-full w-full snap-center relative aspect-[4/5] lg:aspect-[3/4]"
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  </div>
                ))}
                {product.images.length === 0 && (
                  <div className="min-w-full w-full snap-center relative aspect-[4/5] lg:aspect-[3/4] flex items-center justify-center">
                    <span className="text-muted text-xs uppercase tracking-widest">
                      No Image Available
                    </span>
                  </div>
                )}
              </div>

              {/* Desktop Arrow Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    disabled={currentImageIndex === 0}
                    className="hidden lg:flex absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 disabled:opacity-0 shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={scrollNext}
                    disabled={currentImageIndex === product.images.length - 1}
                    className="hidden lg:flex absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 disabled:opacity-0 shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </>
              )}

              {/* Dot Navigation */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 lg:bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToImage(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentImageIndex === i
                          ? "w-5 bg-foreground"
                          : "w-1.5 bg-white/70 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Counter Badge */}
              {product.images.length > 0 && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold tracking-widest z-10">
                  {currentImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO */}
          <div className="w-full lg:w-[40%]">
            <div className="sticky top-24 flex flex-col space-y-6 sm:space-y-8">
              {/* Title & Price */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  {product.isHotDeal && (
                    <span className="bg-red-600 text-white px-2 py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                      Sale
                    </span>
                  )}
                  {product.isTopSeller && (
                    <span className="bg-foreground text-white px-2 py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                      Bestseller
                    </span>
                  )}
                  {product.isNewArrival && (
                    <span className="bg-blue-600 text-white px-2 py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                      New
                    </span>
                  )}
                </div>

                <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium tracking-tight uppercase leading-[0.95] sm:leading-[0.9]">
                  {product.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <p className="text-xl sm:text-2xl font-medium text-foreground tabular-nums">
                    ₦{currentPrice.toLocaleString()}
                  </p>
                  {product.discountPrice && !selectedVariant && (
                    <p className="text-base sm:text-lg text-gray-400 line-through tabular-nums">
                      ₦{product.basePrice.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-widest text-muted">
                  <div className="flex text-black">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.round(Number(averageRating)) ? "fill-black" : "fill-transparent"}`}
                      />
                    ))}
                  </div>
                  <span>
                    {averageRating} ({product.reviews.length})
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {product.description}
              </p>

              {/* Dynamic Color Selector */}
              {product.hasVariants && availableColors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                      Color
                    </span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted">
                      {selectedColor}
                    </span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300 ${selectedColor === color ? "border-foreground p-1" : "border-transparent"}`}
                        aria-label={`Select ${color}`}
                      >
                        <span
                          className="w-full h-full block rounded-full border border-gray-200"
                          style={{
                            backgroundColor: color
                              .toLowerCase()
                              .replace(" ", ""),
                          }}
                        ></span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Size Selector */}
              {product.hasVariants && availableSizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                      Size
                    </span>
                    <button className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted underline hover:text-foreground transition-colors">
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 text-[10px] font-bold uppercase tracking-widest border transition-colors duration-300 text-center ${
                          selectedSize === size
                            ? "bg-foreground text-white border-foreground"
                            : "bg-transparent text-foreground border-gray-200 hover:border-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop CTA & Quantity */}
              <div className="hidden lg:block space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                <div className="flex gap-2 sm:gap-4 h-12 sm:h-14">
                  <div className="flex items-center justify-between border border-gray-200 w-24 sm:w-32 px-3 sm:px-4 text-foreground shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="hover:text-gray-400 transition-colors py-2"
                    >
                      <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <span className="text-[11px] sm:text-xs font-bold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="hover:text-gray-400 transition-colors py-2"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 bg-foreground text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full h-12 sm:h-14 border border-foreground text-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-foreground hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy It Now
                </button>
              </div>

              {/* Mobile Quantity Editor */}
              <div className="lg:hidden space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Qty
                  </span>
                  <div className="flex items-center justify-between border border-gray-200 w-28 px-4 h-11 text-foreground">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="hover:text-gray-400 transition-colors py-2"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] font-bold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="hover:text-gray-400 transition-colors py-2"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-5 sm:py-6 border-y border-gray-200">
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-muted shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted">
                    Free Global Shipping
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-muted shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted">
                    2-Year Warranty
                  </span>
                </div>
              </div>

              {/* Accordions */}
              <div className="pb-8 lg:pb-0">
                {defaultDetails.map((detail, index) => (
                  <Accordion
                    key={index}
                    title={detail.title}
                    content={detail.content}
                    isOpen={openAccordion === detail.title}
                    onClick={() =>
                      setOpenAccordion(
                        openAccordion === detail.title ? null : detail.title,
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS SECTION */}
      {relatedProducts.length > 0 && (
        <section className="py-12 sm:py-16 md:py-24 bg-[#FAFAFA] border-t border-gray-200">
          <div className="container-main mx-auto px-4 sm:px-6 md:px-12">
            <div className="flex justify-between items-end mb-8 sm:mb-12">
              <div>
                <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted mb-1 sm:mb-2">
                  Complete The Look
                </h2>
                <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight uppercase">
                  You May Also Like
                </h3>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-3 sm:gap-4 md:gap-6 hide-scrollbar pb-8 snap-x">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  className="min-w-[160px] xs:min-w-[200px] sm:min-w-[240px] md:min-w-[280px] shrink-0 snap-start"
                >
                  <ProductCard
                    item={item}
                    onQuickAdd={handleQuickAdd}
                    badgeLabel={
                      item.isNewArrival
                        ? "New"
                        : item.isHotDeal
                          ? "Sale"
                          : undefined
                    }
                    badgeColor={item.isHotDeal ? "bg-red-600" : "bg-foreground"}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STICKY MOBILE CTA BAR */}
      <StickyMobileCTA
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        disabled={isOutOfStock}
      />
    </div>
  );
}