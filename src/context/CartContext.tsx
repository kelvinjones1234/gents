// src/context/CartContext.tsx
"use client";

import React, { createContext, useContext, useReducer, useEffect, useMemo } from "react";
import { CartItem, CartState, CartAction } from "@/types/cart";

// --- INITIAL STATE & REDUCER ---
const initialState: CartState = {
  items: {},
  isOpen: false,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { key, ...product } = action.payload;
      const existingItem = state.items[key];
      
      return {
        ...state,
        isOpen: true, // Auto-open cart on add
        items: {
          ...state.items,
          [key]: {
            ...product,
            key,
            quantity: existingItem 
              ? Math.min(existingItem.quantity + product.quantity, product.maxStock) 
              : product.quantity,
          },
        },
      };
    }
    case "REMOVE_ITEM": {
      const newItems = { ...state.items };
      delete newItems[action.payload];
      return { ...state, items: newItems };
    }
    case "UPDATE_QUANTITY": {
      const { key, quantity } = action.payload;
      if (quantity < 1) return state; // handled by remove
      
      const item = state.items[key];
      if (!item) return state;

      return {
        ...state,
        items: {
          ...state.items,
          [key]: { ...item, quantity: Math.min(quantity, item.maxStock) },
        },
      };
    }
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "CLEAR_CART":
      return { ...state, items: {} };
    default:
      return state;
  }
};

// --- CONTEXT CREATION ---
interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // Lazy init to load from localStorage on mount
  const init = (initial: CartState): CartState => {
    if (typeof window === "undefined") return initial;
    const saved = localStorage.getItem("cart-storage");
    return saved ? JSON.parse(saved) : initial;
  };

  const [state, dispatch] = useReducer(cartReducer, initialState, init);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem("cart-storage", JSON.stringify(state));
  }, [state]);

  // Derived State (Optimization)
  const contextValue = useMemo(() => {
    const itemsList = Object.values(state.items);
    const totalItems = itemsList.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = itemsList.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const addItem = (item: Omit<CartItem, "key">) => {
      // Create a unique key based on Product ID + Variant ID
      const key = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
      dispatch({ type: "ADD_ITEM", payload: { ...item, key } });
    };

    return {
      items: itemsList,
      isOpen: state.isOpen,
      totalItems,
      subtotal,
      addItem,
      removeItem: (key: string) => dispatch({ type: "REMOVE_ITEM", payload: key }),
      updateQuantity: (key: string, quantity: number) => 
        dispatch({ type: "UPDATE_QUANTITY", payload: { key, quantity } }),
      toggleCart: () => dispatch({ type: "TOGGLE_CART" }),
    };
  }, [state]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};