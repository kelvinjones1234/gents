"use client";

import { useState, useEffect, useMemo } from "react";
import { X, AlertCircle, Check } from "lucide-react";
import { Product, Category, ProductVariant } from "@prisma/client";

// Ensure this type matches what you pass from the parent
export type ProductWithRelations = Product & {
  categories: Category[];
  variants: ProductVariant[];
};

interface OptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithRelations | null;
  // Updated signature to include specific variant details
  onAddToCart: (
    product: ProductWithRelations,
    variantId: string,
    quantity: number,
    variantPrice: number,
    variantImage?: string
  ) => void;
}

export default function OptionModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: OptionModalProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // --- 1. RESET STATE ON OPEN ---
  useEffect(() => {
    if (isOpen && product) {
      // Get all unique colors
      const colors = Array.from(
        new Set(product.variants.map((v) => v.color).filter(Boolean))
      ) as string[];

      // Default to first color
      const initialColor = colors.length > 0 ? colors[0] : null;
      setSelectedColor(initialColor);

      // Default to first available size for that color
      if (initialColor) {
        const validVariant = product.variants.find(
          (v) => v.color === initialColor && v.stock > 0
        );
        setSelectedSize(validVariant?.size || null);
      } else {
        // Fallback for size-only products
        const sizes = Array.from(
            new Set(product.variants.map((v) => v.size).filter(Boolean))
        ) as string[];
        setSelectedSize(sizes.length > 0 ? sizes[0] : null);
      }

      setQuantity(1);
      setError(null);
    }
  }, [isOpen, product]);

  // --- 2. DERIVED LOGIC ---
  
  // Get unique options
  const uniqueColors = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[];
  }, [product]);

  const uniqueSizes = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[];
  }, [product]);

  // Find the SPECIFIC variant matching both selections
  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((v) => {
      const colorMatch = !uniqueColors.length || v.color === selectedColor;
      const sizeMatch = !uniqueSizes.length || v.size === selectedSize;
      return colorMatch && sizeMatch;
    });
  }, [product, selectedColor, selectedSize, uniqueColors.length, uniqueSizes.length]);

  // Determine pricing and image
  const currentPrice = selectedVariant ? selectedVariant.price : product?.basePrice || 0;
  const currentImage = selectedVariant?.image || product?.images[0] || "/placeholder.png";
  const maxStock = selectedVariant?.stock || 0;
  const isOutOfStock = maxStock <= 0;

  // --- 3. HANDLERS ---

  const handleAddToCart = () => {
    if (!product) return;

    // Validation
    if (product.hasVariants && !selectedVariant) {
      setError("Please select all options.");
      return;
    }
    
    if (selectedVariant && quantity > maxStock) {
      setError(`Only ${maxStock} items available.`);
      return;
    }

    if (!selectedVariant) {
        // Should not happen if hasVariants is true, but safety check
        setError("Variant not selected");
        return;
    }

    // Pass data back to parent
    onAddToCart(
        product, 
        selectedVariant.id, 
        quantity, 
        currentPrice, 
        currentImage
    );
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none p-4">
        <div className="bg-white w-full max-w-md pointer-events-auto shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
          
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div className="flex gap-4">
              <div className="w-16 h-20 bg-gray-50 border border-gray-100 shrink-0">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground pr-4 leading-relaxed line-clamp-2">
                  {product.name}
                </h3>
                <div className="mt-1 flex flex-col">
                    <span className="text-[12px] font-bold tracking-wide text-foreground tabular-nums">
                        ₦{currentPrice.toLocaleString()}
                    </span>
                    {selectedVariant && (
                        <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isOutOfStock ? "text-red-600" : "text-green-600"}`}>
                            {isOutOfStock ? "Out of Stock" : "In Stock"}
                        </span>
                    )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 transition-colors text-gray-400 hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Options */}
          <div className="p-6 overflow-y-auto space-y-8">
            
            {/* COLORS */}
            {uniqueColors.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Color</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => {
                            setSelectedColor(color);
                            // Reset size if the current size doesn't exist for new color
                            if (selectedSize) {
                                const exists = product.variants.some(v => v.color === color && v.size === selectedSize);
                                if (!exists) setSelectedSize(null);
                            }
                        }}
                        className={`px-4 py-2 border text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                          isSelected
                            ? "border-foreground bg-foreground text-white"
                            : "border-gray-200 text-foreground hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZES */}
            {uniqueSizes.length > 0 && (
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Size</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    
                    // Logic: Is this size available for the currently selected color?
                    const variantForThisSize = product.variants.find(
                        v => v.size === size && (!selectedColor || v.color === selectedColor)
                    );
                    
                    const exists = !!variantForThisSize;
                    const hasStock = variantForThisSize ? variantForThisSize.stock > 0 : false;

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={!exists}
                        className={`relative min-w-[40px] px-3 py-2 border text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                          isSelected
                            ? "border-foreground bg-foreground text-white"
                            : exists && hasStock
                                ? "border-gray-200 text-foreground hover:border-gray-400"
                                : "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                        }`}
                      >
                        {size}
                        {/* Diagonal strike for unavailable items */}
                        {(!exists || !hasStock) && (
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-1/2 left-0 w-full border-b border-gray-300 -rotate-45 transform origin-center"></div>
                            </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Quantity</span>
                <div className="flex items-center w-32 border border-gray-200">
                    <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-3 hover:bg-gray-50 text-muted transition-colors"
                    >
                        -
                    </button>
                    <div className="flex-1 text-center text-[11px] font-bold tabular-nums">
                        {quantity}
                    </div>
                     <button 
                        onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                        className="px-3 py-3 hover:bg-gray-50 text-muted transition-colors"
                        disabled={quantity >= maxStock}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 text-[10px] font-bold uppercase tracking-widest border border-red-100">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || (product.hasVariants && !selectedVariant)}
              className={`w-full py-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                isOutOfStock
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