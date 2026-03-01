"use client";

import { useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { verifyAndCreateOrder } from "@/app/actions/general/checkout";

interface CheckoutButtonProps {
  email: string; // Pass the logged-in user's email
  amount: number; // The subtotal
} 

export default function CheckoutButton({ email, amount }: CheckoutButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { items, clearCart } = useCart(); // Assuming you have a clearCart method

  // Hardcoded for demonstration. In reality, collect this via a form before checkout.
  const dummyShippingAddress = {
    street: "123 Gents Avenue",
    city: "Lekki",
    state: "Lagos", 
    country: "Nigeria",
    postalCode: "100001",
  };

  const config = {
    reference: `REF-${new Date().getTime()}`,
    email: email,
    amount: amount * 100, // Paystack requires Kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY as string,
    currency: "NGN",
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    setIsProcessing(true);

    // Call our Server Action to verify and save the order
    const result = await verifyAndCreateOrder(
      reference.reference,
      items, // The cart items from your context
      dummyShippingAddress,
    );

    setIsProcessing(false);

    if (result.success) {
      // Clear the local storage cart
      if (clearCart) clearCart();

      // Redirect to a sleek success page
      router.push(`/order/success?order=${result.orderId}`);
    } else {
      // Handle error (e.g., show a toast notification)
      alert(result.error || "Failed to save order.");
    }
  };

  const onClose = () => {
    console.log("Payment window closed.");
  };

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    initializePayment({ onSuccess, onClose });
  };

  return (
    <button
      onClick={handleCheckoutClick}
      disabled={isProcessing || items.length === 0}
      className="w-full py-4 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing Order...
        </>
      ) : (
        <>
          <Lock className="w-3 h-3 group-hover:text-foreground transition-colors" />
          Secure Checkout — ₦{amount.toLocaleString()}
        </>
      )}
    </button>
  );
}
