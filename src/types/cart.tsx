export interface CartItem {
  key: string;
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  maxStock: number;
}

export interface CartState {
  items: Record<string, CartItem>;
  isOpen: boolean;
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { key: string; quantity: number } }
  | { type: "TOGGLE_CART" }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_FROM_STORAGE"; payload: CartState }; // <--- ADD THIS