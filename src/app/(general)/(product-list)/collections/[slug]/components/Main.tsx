"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, X, Layers } from "lucide-react";
import { ProductCard } from "@/app/(general)/components/ProductCard";
import { useCart } from "@/context/CartContext";
import OptionModal from "@/app/(general)/components/OptionsModal";
import { Product, Category, ProductVariant } from "@prisma/client";

// Types
type ProductWithRelations = Product & {
  categories: Category[];
  variants: ProductVariant[];
};

type CategoryData = Category & {
  products: ProductWithRelations[];
};

interface MainProps {
  categoryData: CategoryData;
}

export default function Main({ categoryData }: MainProps) {
  const { addItem, toggleCart } = useCart();

  // --- State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);

  const ITEMS_PER_PAGE = 8;
  const products = categoryData.products;

  // --- Filtering & Search ---
  const filteredProducts = useMemo(() => {
    return products.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, products]);

  // --- Pagination Logic ---
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentItems = useMemo(() => {
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, startIndex]);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- Handlers ---
  const handleQuickAdd = useCallback((product: ProductWithRelations) => {
    if (product.hasVariants) {
      setSelectedProduct(product);
      setIsOptionModalOpen(true);
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.discountPrice || product.basePrice,
        image: product.images[0],
        quantity: 1,
        maxStock: product.stock,
      });
      toggleCart();
    }
  }, [addItem, toggleCart]);

  const handleModalAddToCart = useCallback((product: any, variantId: string, quantity: number, variantPrice: number, variantImage?: string) => {
    const variant = product.variants?.find((v: any) => v.id === variantId);
    addItem({
      productId: product.id,
      variantId: variantId,
      name: product.name,
      variantName: variant ? `${variant.color || ""} ${variant.size || ""}`.trim() : undefined,
      price: variantPrice,
      image: variantImage || product.images[0],
      quantity: quantity,
      maxStock: variant?.stock || 0,
    });
    setIsOptionModalOpen(false);
    toggleCart();
  }, [addItem, toggleCart]);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <OptionModal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        product={selectedProduct}
        onAddToCart={handleModalAddToCart}
      />

      {/* Header */}
      <header className="pt-24 pb-16 bg-white border-b border-gray-100">
        <div className="container-main mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-muted mb-4">
            <Layers className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em]">
              Collection
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tighter mb-10">
            {categoryData.name}
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`SEARCH ${categoryData.name.toUpperCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-gray-200 py-4 px-12 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-black transition placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1">
        <div className="container-main mx-auto px-6 md:px-12 py-16">
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center uppercase text-[10px] tracking-widest text-muted">
              No products found in this collection.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-14 sm:gap-x-6 sm:gap-y-20">
              {currentItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  badgeLabel={item.isNewArrival ? "New" : item.isHotDeal ? "Sale" : undefined}
                  badgeColor={item.isHotDeal ? "bg-red-600" : "bg-blue-600"}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Pagination Footer */}
      {filteredProducts.length > 0 && (
        <footer className="border-t border-gray-200 bg-[#FAFAFA]">
          <div className="container-main mx-auto px-6 md:px-12 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted">
              Showing {startIndex + 1}–
              {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of {totalItems} Products
            </p>

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
                Page {currentPage} of {totalPages || 1}
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
          </div>
        </footer>
      )}
    </div>
  );
}