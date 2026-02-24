// src/types/cart.ts

export interface CartItem {
  key: string; // Unique ID (productId + variantId)
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string; // e.g., "Blue / XL"
  price: number;
  originalPrice?: number; // For strikethrough UI
  image: string;
  quantity: number;
  maxStock: number; // To prevent adding more than available
}

export interface CartState {
  items: Record<string, CartItem>; // The Map
  isOpen: boolean;
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string } // Payload is the Key
  | { type: "UPDATE_QUANTITY"; payload: { key: string; quantity: number } }
  | { type: "TOGGLE_CART" }
  | { type: "CLEAR_CART" };