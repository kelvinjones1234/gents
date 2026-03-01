"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
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
    case "ADD_ITEM": {
      const product = action.payload;
      const key = product.key;
      const existingItem = state.items[key];
      const newQuantity = existingItem
        ? existingItem.quantity + product.quantity
        : product.quantity;
      return {
        ...state,
        isOpen: true,
        items: {
          ...state.items,
          [key]: {
            ...product,
            quantity: Math.min(newQuantity, product.maxStock),
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
      const item = state.items[key];
      if (!item || quantity < 1) return state;
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

    case "LOAD_FROM_STORAGE":
      return { ...state, items: action.payload.items };

    default:
      return state;
  }
};

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  isHydrated: boolean;
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount, then mark as hydrated
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart-storage");
      if (saved) {
        const parsedState = JSON.parse(saved);
        dispatch({ type: "LOAD_FROM_STORAGE", payload: parsedState });
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist to localStorage whenever state changes (only after hydration to avoid overwriting with empty state)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart-storage", JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const value = useMemo(() => {
    const itemsList = Object.values(state.items);
    const totalItems = itemsList.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = itemsList.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const addItem = (item: Omit<CartItem, "key">) => {
      const key = item.variantId
        ? `${item.productId}-${item.variantId}`
        : item.productId;
      const newItem = { ...item, key };

      // Calculate new items synchronously
      const existingItem = state.items[key];
      const newQuantity = existingItem
        ? existingItem.quantity + item.quantity
        : item.quantity;
      const newItems = {
        ...state.items,
        [key]: {
          ...newItem,
          quantity: Math.min(newQuantity, item.maxStock),
        },
      };

      // Write to localStorage SYNCHRONOUSLY before dispatch
      // This guarantees it's available when checkout page mounts
      try {
        localStorage.setItem(
          "cart-storage",
          JSON.stringify({ ...state, items: newItems }),
        );
      } catch (e) {
        console.error("Failed to save cart", e);
      }

      dispatch({ type: "ADD_ITEM", payload: newItem });
    };
    return {
      items: itemsList,
      isOpen: state.isOpen,
      isHydrated,
      totalItems,
      subtotal,
      addItem,
      removeItem: (key: string) =>
        dispatch({ type: "REMOVE_ITEM", payload: key }),
      updateQuantity: (key: string, quantity: number) =>
        dispatch({ type: "UPDATE_QUANTITY", payload: { key, quantity } }),
      toggleCart: () => dispatch({ type: "TOGGLE_CART" }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    };
  }, [state, isHydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
