"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { ProductCard } from "@/app/(general)/components/ProductCard"; // Adjust path if needed
import OptionModal from "@/app/(general)/components/OptionsModal"; // Adjust path if needed
import { useCart } from "@/context/CartContext";
import { SearchX } from "lucide-react";
import Link from "next/link";

interface ProductGridProps {
  products: any[];
  searchQuery?: string;
}

export default function Main({ products, searchQuery }: ProductGridProps) {
  const { addItem, toggleCart } = useCart();
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // 12 perfectly fills 2, 3, and 4 column grids

  // --- PAGINATION LOGIC ---
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentItems = useMemo(() => {
    return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [products, startIndex]);

  // Reset to page 1 whenever the user searches for something new or changes categories
  useEffect(() => {
    setCurrentPage(1);
  }, [products, searchQuery]);

  // --- QUICK ADD HANDLERS ---
  const handleQuickAdd = useCallback(
    (item: any) => {
      if (item.hasVariants) {
        setSelectedProduct(item);
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
      toggleCart();
    },
    [addItem, toggleCart],
  );

  // --- EMPTY STATE ---
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <SearchX className="w-12 h-12 text-gray-300 mb-6" strokeWidth={1} />
        <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-widest mb-4">
          No Products Found
        </h2>
        <p className="text-muted text-xs sm:text-sm max-w-md leading-relaxed mb-8">
          {searchQuery
            ? `We couldn't find any results for "${searchQuery}". Try checking your spelling or using less specific keywords.`
            : "There are currently no products available in this collection. Please check back later."}
        </p>
        <Link
          href="/collections/products/all"
          className="bg-foreground text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors"
        >
          Clear Search
        </Link>
      </div>
    );
  }

  // --- PRODUCT GRID & PAGINATION ---
  return (
    <div className="flex flex-col space-y-12">
      <OptionModal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        product={selectedProduct}
        onAddToCart={handleModalAddToCart}
      />

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {currentItems.map((product) => (
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
            badgeColor={product.isHotDeal ? "bg-red-600" : "bg-foreground"}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {products.length > 0 && (
        <div className="border-t border-gray-200 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted">
            Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of {totalItems} Products
          </p>

          {/* Only show next/prev buttons if there is more than 1 page */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-200 text-[9px] font-bold uppercase tracking-widest disabled:opacity-30 hover:border-foreground bg-white transition"
              >
                Prev
              </button>

              <span className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage >= totalPages}
                className="px-3 py-2 border border-gray-200 text-[9px] font-bold uppercase tracking-widest disabled:opacity-30 hover:border-foreground bg-white transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}