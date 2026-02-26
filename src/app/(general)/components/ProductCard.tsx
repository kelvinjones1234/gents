"use client";

import { memo } from "react";
import Link from "next/link"; // 1. Import Link from Next.js
import { Product, Category, ProductVariant } from "@prisma/client";

type ProductWithRelations = Product & {
  categories: Category[];
  variants: ProductVariant[];
};

interface ProductCardProps {
  item: ProductWithRelations;
  badgeLabel?: string;
  badgeColor?: string;
  onQuickAdd: (item: ProductWithRelations) => void;
}

export const ProductCard = memo(({
  item,
  badgeLabel,
  badgeColor = "bg-foreground",
  onQuickAdd,
}: ProductCardProps) => {
  const totalStock = item.hasVariants && item.variants
    ? item.variants.reduce((sum, v) => sum + v.stock, 0)
    : item.stock;
  const isSoldOut = totalStock <= 0;

  return (
    // 2. Wrap the card in a Link component. Ensure item.slug exists in your Prisma schema.
    <Link 
      href={`/products/${item.slug}`} 
      className="w-full group cursor-pointer flex flex-col transform-gpu"
    >
      <div className="aspect-[3/4] sm:aspect-[4/5] w-full bg-[#EFEFEF] relative overflow-hidden border border-gray-100">
        
        {/* Badges */}
        {isSoldOut ? (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-white px-2 py-1 text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-foreground shadow-sm">
              Sold Out
            </span>
          </div>
        ) : badgeLabel && (
          <div className="absolute top-3 left-3 z-20">
            <span className={`${badgeColor} text-white px-2 py-1 text-[7px] sm:text-[9px] font-bold uppercase tracking-widest shadow-sm`}>
              {badgeLabel}
            </span>
          </div>
        )}

        {/* Image */}
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 bg-[#EFEFEF] transition-colors duration-500 group-hover:bg-[#E5E5E5]">
          <img
            src={item.images[0] || "/placeholder.png"}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${isSoldOut ? "opacity-50 grayscale" : ""}`}
            loading="lazy"
          />
        </div>

        {/* Action Button */}
        {!isSoldOut && (
          <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
            <button
              onClick={(e) => {
                // 3. Prevent the link from triggering when the button is clicked
                e.preventDefault(); 
                e.stopPropagation();
                onQuickAdd(item);
              }}
              className="w-full bg-foreground/95 py-3 sm:py-4 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm hover:bg-black transition-colors"
            >
              {item.hasVariants ? "Select Options" : "Quick Add"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center text-center space-y-1 px-1">
        <h3 className="text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-foreground leading-tight line-clamp-2 min-h-[2.5em]">
          {item.name}
        </h3>
        <div className="flex items-center gap-2">
          {item.discountPrice ? (
            <>
              <p className="text-[9px] sm:text-[11px] font-bold text-gray-400 line-through">₦{item.basePrice.toLocaleString()}</p>
              <p className="text-[9px] sm:text-[11px] font-bold text-red-600">₦{item.discountPrice.toLocaleString()}</p>
            </>
          ) : (
            <p className="text-[9px] sm:text-[11px] font-bold text-foreground">₦{item.basePrice.toLocaleString()}</p>
          )}
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";