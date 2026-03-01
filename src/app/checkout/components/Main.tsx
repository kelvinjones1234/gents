"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
// 1. Keep the import
import { usePaystackPayment } from "react-paystack";
import {
  Plus,
  Minus,
  Check,
  Loader2,
  ChevronRight,
  Lock,
  ShieldCheck,
  Edit2,
  X,
} from "lucide-react";
import { verifyAndCreateOrder } from "@/app/actions/general/checkout";
import { getUserAddresses, saveAddress } from "@/app/actions/addresses";
import { Address } from "@prisma/client";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, subtotal, clearCart, isHydrated, updateQuantity, removeItem } =
    useCart();

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // --- ADDRESS STATE ---
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  // Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const defaultFormState = {
    tag: "Home",
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
    postalCode: "",
  };
  const [formData, setFormData] = useState(defaultFormState);

  const shippingFee: number = 0;
  const orderTotal = subtotal + shippingFee;

  // --- FETCH ADDRESSES ON MOUNT ---
  useEffect(() => {
    setMounted(true);

    if (status === "unauthenticated") {
      router.push(
        `/account/login?callbackUrl=${encodeURIComponent("/checkout")}`,
      );
      return;
    }

    if (status === "authenticated") {
      fetchAddresses();
    }
  }, [status, router]);

  const fetchAddresses = async () => {
    setIsLoadingAddresses(true);
    const res = await getUserAddresses();
    if (res.success && res.addresses) {
      setAddresses(res.addresses);
      if (res.addresses.length > 0) {
        setSelectedAddressId(res.addresses[0].id);
      }
    }
    setIsLoadingAddresses(false);
  };

  // --- HANDLERS ---
  const handleEditClick = (address: Address) => {
    setEditingAddressId(address.id);
    setFormData({
      tag: address.tag || "Home",
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode || "",
    });
    setShowAddressForm(true);
  };

  const handleAddNewClick = () => {
    setEditingAddressId(null);
    setFormData(defaultFormState);
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);

    const payload = editingAddressId
      ? { id: editingAddressId, ...formData }
      : formData;

    const res = await saveAddress(payload);

    if (res.success && res.address) {
      await fetchAddresses();
      setSelectedAddressId(res.address.id);
      setShowAddressForm(false);
    } else {
      alert(res.error || "Failed to save address.");
    }

    setIsSavingAddress(false);
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // --- CART EDIT HANDLERS ---
  const handleIncrease = (item: any) => {
    if (item.maxStock && item.quantity >= item.maxStock) return;
    updateQuantity(item.key, item.quantity + 1);
  };

  const handleDecrease = (item: any) => {
    if (item.quantity <= 1) {
      removeItem(item.key);
    } else {
      updateQuantity(item.key, item.quantity - 1);
    }
  };

  // --- PAYSTACK INTEGRATION ---
  // 2. Wrap the config and hook initialization to prevent SSR execution
  const paystackConfig = mounted
    ? {
        reference: `REF-${new Date().getTime()}`,
        email: session?.user?.email || "",
        amount: orderTotal * 100,
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY as string,
        currency: "NGN",
      }
    : null; // Fallback for server-side

  // We have to call the hook unconditionally, but we pass a dummy config if not mounted
  // to avoid React hook rule violations.
  const initializePayment = usePaystackPayment(
    paystackConfig || { publicKey: "", amount: 0, reference: "", email: "" }
  );

  const handlePaymentSuccess = async (reference: any) => {
    setIsProcessing(true);

    if (!selectedAddress) {
      alert("Please select a shipping address.");
      setIsProcessing(false);
      return;
    }

    const mappedShippingAddress = {
      street: selectedAddress.street,
      city: selectedAddress.city,
      state: selectedAddress.state,
      country: selectedAddress.country,
      postalCode: selectedAddress.postalCode || "",
    };

    const result = await verifyAndCreateOrder(
      reference.reference,
      items,
      mappedShippingAddress,
    );

    setIsProcessing(false);

    if (result.success) {
      if (clearCart) clearCart();
      router.push(`/order/success?order=${result.orderId}`);
    } else {
      alert(
        result.error ||
          "Payment successful, but order creation failed. Please contact support.",
      );
    }
  };

  const handleCheckout = () => {
    if (!selectedAddressId) {
      alert("Please add and select a shipping address before proceeding.");
      return;
    }
    // Only call initializePayment if we are mounted and have a valid config
    if (mounted && paystackConfig?.publicKey) {
        initializePayment({
            onSuccess: handlePaymentSuccess,
            onClose: () => console.log("Closed"),
        });
    }
  };

  // Wait for page mount, session, AND cart hydration from localStorage
  if (!mounted || status === "loading" || !isHydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  // Only show empty cart AFTER hydration is confirmed
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <h1 className="font-display text-2xl uppercase tracking-widest">
          Your Cart is Empty
        </h1>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-4 bg-foreground text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-foreground font-sans selection:bg-black selection:text-white pb-24">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="container-main mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center">
          <h1 className="text-[12px] sm:text-sm font-bold uppercase tracking-[0.2em]">
            Secure Checkout
          </h1>
          <Lock className="w-4 h-4 text-muted" />
        </div>
      </header>

      <div className="container-main mx-auto px-4 sm:px-6 md:px-12 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* LEFT COLUMN: SHIPPING & DETAILS */}
          <div className="flex-1 space-y-10">
            {/* Contact Info */}
            <section className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted border-b border-gray-200 pb-3">
                1. Contact Information
              </h2>
              <div className="p-4 bg-white border border-gray-200 text-sm">
                <p className="font-medium">
                  {session?.user?.name || "Customer"}
                </p>
                <p className="text-muted">{session?.user?.email}</p>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted border-b border-gray-200 pb-3">
                2. Shipping Address
              </h2>

              {isLoadingAddresses ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted" />
                </div>
              ) : (
                <>
                  {addresses.length > 0 && !showAddressForm && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`relative p-4 cursor-pointer border transition-colors duration-300 ${
                            selectedAddressId === addr.id
                              ? "border-foreground bg-white"
                              : "border-gray-200 bg-white/50 hover:border-gray-300"
                          }`}
                        >
                          <div
                            className="absolute inset-0 z-0"
                            onClick={() => setSelectedAddressId(addr.id)}
                          />

                          <div className="relative z-10 flex justify-between items-start mb-2">
                            <span className="font-bold text-[10px] bg-gray-100 px-2 py-1 uppercase tracking-wider">
                              {addr.tag || "Address"}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditClick(addr)}
                                className="text-muted hover:text-foreground transition-colors p-1"
                                aria-label="Edit address"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {selectedAddressId === addr.id && (
                                <Check className="w-4 h-4 text-foreground" />
                              )}
                            </div>
                          </div>

                          <div className="relative z-10 text-xs text-muted space-y-0.5 leading-relaxed mt-2 pointer-events-none">
                            <p>{addr.street}</p>
                            <p>
                              {addr.city}, {addr.state} {addr.postalCode}
                            </p>
                            <p>{addr.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!showAddressForm && (
                    <button
                      onClick={handleAddNewClick}
                      className="w-full py-4 border border-dashed border-gray-300 text-[10px] font-bold uppercase tracking-widest text-muted hover:border-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-3 h-3" /> Add New Address
                    </button>
                  )}

                  {showAddressForm && (
                    <form
                      onSubmit={handleAddressSubmit}
                      className="bg-white border border-gray-200 p-6 space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest">
                          Address Label (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Home, Office"
                          value={formData.tag}
                          onChange={(e) =>
                            setFormData({ ...formData, tag: e.target.value })
                          }
                          className="w-full border border-gray-200 p-3 text-sm focus:border-foreground focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest">
                          Street Address
                        </label>
                        <input
                          required
                          type="text"
                          value={formData.street}
                          onChange={(e) =>
                            setFormData({ ...formData, street: e.target.value })
                          }
                          className="w-full border border-gray-200 p-3 text-sm focus:border-foreground focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest">
                            City
                          </label>
                          <input
                            required
                            type="text"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                            className="w-full border border-gray-200 p-3 text-sm focus:border-foreground focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest">
                            State
                          </label>
                          <input
                            required
                            type="text"
                            value={formData.state}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                state: e.target.value,
                              })
                            }
                            className="w-full border border-gray-200 p-3 text-sm focus:border-foreground focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest">
                            Country
                          </label>
                          <input
                            required
                            type="text"
                            value={formData.country}
                            readOnly
                            className="w-full border border-gray-200 bg-gray-50 p-3 text-sm text-muted focus:outline-none cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest">
                            Zip / Postal Code
                          </label>
                          <input
                            type="text"
                            value={formData.postalCode}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                postalCode: e.target.value,
                              })
                            }
                            className="w-full border border-gray-200 p-3 text-sm focus:border-foreground focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="flex-1 py-4 border border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingAddress}
                          className="flex-1 py-4 bg-foreground text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                          {isSavingAddress ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Save Address"
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="bg-white border border-gray-200 sticky top-24">
              <div className="p-6 md:p-8 space-y-8">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted border-b border-gray-200 pb-3">
                  Order Summary
                </h2>

                {/* Cart Items with Editable Controls */}
                <div className="space-y-6 max-h-[40vh] overflow-y-auto hide-scrollbar pr-2">
                  {items.map((item) => (
                    <div key={item.key} className="flex gap-4 group">
                      <div className="w-16 h-20 bg-[#EFEFEF] shrink-0 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider line-clamp-1">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => removeItem(item.key)}
                              className="text-muted hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
                              aria-label="Remove item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {item.variantName && (
                            <p className="text-[10px] text-muted uppercase tracking-widest mt-1">
                              {item.variantName}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center justify-between border border-gray-200 w-20 h-7 px-2">
                            <button
                              onClick={() => handleDecrease(item)}
                              className="text-muted hover:text-foreground py-1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncrease(item)}
                              className="text-muted hover:text-foreground py-1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <p className="text-sm font-medium tabular-nums">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex justify-between items-center text-xs text-muted uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted uppercase tracking-widest">
                    <span>Shipping</span>
                    <span>
                      {shippingFee === 0
                        ? "Free"
                        : `₦${shippingFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest pt-4 border-t border-gray-200">
                    <span>Total</span>
                    <span className="tabular-nums text-lg">
                      ₦{orderTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={
                    isProcessing || !selectedAddressId || isLoadingAddresses
                  }
                  className="w-full py-5 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-transparent hover:text-foreground transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Pay ₦{orderTotal.toLocaleString()}{" "}
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[9px] text-muted uppercase tracking-widest pt-2">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Payments processed securely by Paystack</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}