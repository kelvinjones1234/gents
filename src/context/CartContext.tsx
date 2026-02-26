"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { CartItem, CartState, CartAction } from "@/types/cart";

const initialState: CartState = {
  items: {},
  isOpen: false,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    // ... (Keep existing ADD_ITEM, REMOVE_ITEM, cases) ...
    
    // Copy-paste existing cases for ADD, REMOVE, UPDATE, TOGGLE here 
    // or keep them if you are editing the file.
    
    case "ADD_ITEM": {
       /* Use previous logic */
       const product = action.payload;
       const key = product.key;
       const existingItem = state.items[key];
       const newQuantity = existingItem ? existingItem.quantity + product.quantity : product.quantity;
       return { ...state, isOpen: true, items: { ...state.items, [key]: { ...product, quantity: Math.min(newQuantity, product.maxStock) } } };
    }
    case "REMOVE_ITEM": {
       const newItems = { ...state.items };
       delete newItems[action.payload];
       return { ...state, items: newItems };
    }
    case "UPDATE_QUANTITY": {
       const { key, quantity } = action.payload;
       const item = state.items[key];
       if (!item || quantity < 1) return state;
       return { ...state, items: { ...state.items, [key]: { ...item, quantity: Math.min(quantity, item.maxStock) } } };
    }
    case "TOGGLE_CART":
       return { ...state, isOpen: !state.isOpen };
    case "CLEAR_CART":
       return { ...state, items: {} };

    // --- NEW CASE ---
    case "LOAD_FROM_STORAGE":
      return { ...state, items: action.payload.items }; // We usually only load items, not isOpen status
      
    default:
      return state;
  }
};

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

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // 1. ALWAYS initialize with server-safe default (empty)
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // 2. Load from storage ONLY on the client, after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart-storage");
      if (saved) {
        const parsedState = JSON.parse(saved);
        dispatch({ type: "LOAD_FROM_STORAGE", payload: parsedState });
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, []);

  // 3. Persist to storage on change (Skip initial empty render if you want, or just let it sync)
  useEffect(() => {
    // Only save if we have data or if we want to clear storage on empty
    if (state !== initialState) {
        localStorage.setItem("cart-storage", JSON.stringify(state));
    }
  }, [state]);

  const value = useMemo(() => {
    const itemsList = Object.values(state.items);
    const totalItems = itemsList.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = itemsList.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const addItem = (item: Omit<CartItem, "key">) => {
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
      updateQuantity: (key: string, quantity: number) => dispatch({ type: "UPDATE_QUANTITY", payload: { key, quantity } }),
      toggleCart: () => dispatch({ type: "TOGGLE_CART" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};