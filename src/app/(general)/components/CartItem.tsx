"use client";

import { memo } from "react";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
}

const CartItem = memo(({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  return (
    <div className="flex gap-4 md:gap-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Product Image */}
      <div className="w-20 h-28 md:w-24 md:h-32 bg-[#FAFAFA] shrink-0 relative border border-gray-100 overflow-hidden group rounded-sm">
        <Image
          src={item.image}
          alt={item.name} 
          fill
          sizes="(max-width: 768px) 80px, 96px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Details & Controls */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground leading-relaxed max-w-[150px] md:max-w-[180px] line-clamp-2">
              {item.name}
            </h3>
            <p className="text-[11px] font-bold tracking-wide tabular-nums text-foreground">
              ₦{item.price.toLocaleString()}
            </p>
          </div>

          <div className="text-[10px] text-muted uppercase tracking-widest space-y-0.5">
            {item.variantName && <p>{item.variantName}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-200 rounded-sm">
            <button
              onClick={() => onUpdateQuantity(item.key, item.quantity - 1)}
              className="px-2 py-1.5 md:px-3 md:py-2 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3 text-muted" />
            </button>
            <span className="text-[10px] font-bold w-6 text-center tabular-nums text-foreground">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.key, item.quantity + 1)}
              className="px-2 py-1.5 md:px-3 md:py-2 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={item.quantity >= item.maxStock}
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3 text-muted" />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.key)}
            className="text-[9px] font-bold uppercase tracking-widest text-muted hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 pb-0.5"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = "CartItem";

export default CartItem;