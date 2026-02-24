"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { Product, Category, ProductVariant } from "@prisma/client";

type ProductWithRelations = Product & {
  categories: Category[];
  variants: ProductVariant[];
};

interface OptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithRelations | null;
  onAddToCart: (product: ProductWithRelations, variantId?: string, quantity?: number) => void;
}

export default function OptionModal({ isOpen, onClose, product, onAddToCart }: OptionModalProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Reset state when product changes
  useEffect(() => {
    if (isOpen && product) {
      // Auto-select first available options if possible
      const colors = Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)));
      const sizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));
      
      setSelectedColor(colors.length > 0 ? (colors[0] as string) : null);
      setSelectedSize(sizes.length > 0 ? (sizes[0] as string) : null);
      setQuantity(1);
      setError(null);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // --- DERIVED STATE ---
  
  // Get unique attributes
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)));
  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));

  // Find the specific variant based on selection
  const selectedVariant = product.variants.find((v) => {
    const colorMatch = !uniqueColors.length || v.color === selectedColor;
    const sizeMatch = !uniqueSizes.length || v.size === selectedSize;
    return colorMatch && sizeMatch;
  });

  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;
  const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      setError("Please select all options");
      return;
    }
    if (selectedVariant.stock < quantity) {
      setError("Insufficient stock available");
      return;
    }
    
    onAddToCart(product, selectedVariant.id, quantity);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none p-4">
        <div className="bg-white w-full max-w-md pointer-events-auto shadow-2xl flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div className="flex gap-4">
              <div className="w-16 h-20 bg-gray-100 border border-gray-200 shrink-0">
                <img 
                  src={selectedVariant?.image || product.images[0] || "/placeholder.png"} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground pr-4 leading-relaxed">
                  {product.name}
                </h3>
                <p className="text-[12px] font-bold tracking-wide text-foreground mt-1">
                   ₦{currentPrice.toLocaleString()}
                </p>
                {product.hasVariants && (
                   <p className="text-[10px] text-muted mt-1 uppercase tracking-widest">
                     {selectedVariant ? (selectedVariant.stock > 0 ? "In Stock" : "Sold Out") : "Select Options"}
                   </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* COLORS */}
            {uniqueColors.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Select Color</span>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={String(color)}
                        onClick={() => setSelectedColor(color as string)}
                        className={`px-4 py-2 border text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                          isSelected 
                            ? "border-foreground bg-foreground text-white" 
                            : "border-gray-200 text-foreground hover:border-gray-400"
                        }`}
                      >
                        {String(color)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZES */}
            {uniqueSizes.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Select Size</span>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    // Check availability for this size given the selected color
                    const isAvailable = product.variants.some(
                       v => v.size === size && (!selectedColor || v.color === selectedColor) && v.stock > 0
                    );

                    return (
                      <button
                        key={String(size)}
                        onClick={() => setSelectedSize(size as string)}
                        disabled={!isAvailable} // Optional: Disable completely if combination doesn't exist
                        className={`min-w-[40px] px-3 py-2 border text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                          isSelected 
                            ? "border-foreground bg-foreground text-white" 
                            : isAvailable 
                                ? "border-gray-200 text-foreground hover:border-gray-400"
                                : "border-gray-100 text-gray-300 cursor-not-allowed decoration-slice line-through"
                        }`}
                      >
                        {String(size)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 text-[10px] font-bold uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          {/* Footer / Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 mt-auto">
             <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || !selectedVariant}
                className={`w-full py-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  isOutOfStock || !selectedVariant
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-foreground text-white hover:bg-black"
                }`}
             >
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
             </button>
          </div>

        </div>
      </div>
    </>
  );
}