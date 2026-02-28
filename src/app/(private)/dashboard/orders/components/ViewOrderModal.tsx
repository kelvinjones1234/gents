"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { getOrderById, updateOrderStatus } from "@/app/actions/admin/order";

interface ViewOrderModalProps {
  orderId: string;
  onClose: () => void;
}

export default function ViewOrderModal({
  orderId,
  onClose,
}: ViewOrderModalProps) {
  const { toast } = useToast();

  // --- STATE ---
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const result = await getOrderById(orderId);
        if (result.success && result.order) {
          setOrder(result.order);
          setNewStatus(result.order.status);
        } else {
          toast(result.error || "Failed to load order details.", "error");
          onClose();
        }
      } catch (error) {
        toast("An unexpected error occurred.", "error");
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId, toast, onClose]);

  // --- HANDLERS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus === order?.status) {
      return onClose(); // No changes made
    }

    setIsSubmitting(true);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        toast("Order status updated successfully.", "success");
        onClose();
      } else {
        toast(result.error || "Failed to update order.", "error");
      }
    } catch (error) {
      toast("An unexpected error occurred while updating.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI HELPERS ---
  const getPaymentBadge = (status: string) => {
    const base =
      "inline-flex items-center px-2 py-1 text-[9px] font-bold uppercase tracking-widest border";
    switch (status) {
      case "SUCCESS":
        return `${base} bg-green-50 text-green-700 border-green-200`;
      case "FAILED":
      case "REFUNDED":
        return `${base} bg-red-50 text-red-700 border-red-200`;
      default:
        return `${base} bg-orange-50 text-orange-700 border-orange-200`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-500">
        <Loader2 className="w-8 h-8 text-muted animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
          Loading Order Details...
        </p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-lg font-medium tracking-tight uppercase text-foreground">
            Order {order.orderNumber}
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Placed on{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-3 px-6 py-3.5 bg-transparent text-foreground border border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:border-foreground transition-colors duration-300 group shrink-0"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            strokeWidth={1.5}
          />{" "}
          Back to Orders
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 shadow-sm flex flex-col"
      >
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* LEFT COL: Items & Financials */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Items */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Purchased Items
                </h3>
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-[#FAFAFA] border border-gray-100"
                    >
                      <div className="w-16 h-16 bg-gray-100 border border-gray-200 shrink-0 overflow-hidden">
                        <img
                          src={
                            item.variant?.image ||
                            item.product?.images?.[0] ||
                            "https://placehold.co/150x150"
                          }
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-foreground line-clamp-1">
                          {item.product?.name}
                        </span>
                        {(item.variant?.color || item.variant?.size) && (
                          <span className="text-[9px] uppercase tracking-widest text-muted mt-1">
                            {item.variant?.color}{" "}
                            {item.variant?.color && item.variant?.size
                              ? "/"
                              : ""}{" "}
                            {item.variant?.size}
                          </span>
                        )}
                        <span className="text-[9px] uppercase tracking-widest text-muted mt-1">
                          SKU: {item.variant?.sku || item.product?.sku}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold tabular-nums text-foreground">
                          ₦{item.price.toLocaleString()}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-muted">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Payment Details
                </h3>
                <div className="bg-[#FAFAFA] border border-gray-200 p-5 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                      ₦{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted">
                    <span>Shipping</span>
                    <span className="tabular-nums">₦0.00</span>{" "}
                    {/* Adjust if you charge shipping */}
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                      Total Paid
                    </span>
                    <span className="text-[14px] font-bold tabular-nums text-foreground">
                      ₦{order.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center mt-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted">
                      Payment Status
                    </span>
                    <span
                      className={getPaymentBadge(
                        order.payment?.status || "PENDING",
                      )}
                    >
                      {order.payment?.status || "PENDING"}
                    </span>
                  </div>
                  {order.payment?.reference && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted">
                        Ref / Provider
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-muted">
                        {order.payment.reference} ({order.payment.provider})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COL: Status & Customer */}
            <div className="space-y-6">
              {/* Status Updater */}
              <div className="bg-[#FAFAFA] border border-gray-200 p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-gray-200 pb-2 mb-4">
                  Fulfillment Status
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-muted mb-2">
                      Update Order Status
                    </label>
                    <div className="relative">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors appearance-none cursor-pointer"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-muted absolute right-4 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-[#FAFAFA] border border-gray-200 p-5 space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> Customer Profile
                </h3>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                    {order.user?.fullName || "Guest User"}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-muted mt-1">
                    {order.user?.email}
                  </p>
                  {/* Assuming phone is available through a profile relation, adjust if needed */}
                  {order.user?.profile?.phone && (
                    <p className="text-[9px] uppercase tracking-widest text-muted mt-1">
                      {order.user.profile.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-[#FAFAFA] border border-gray-200 p-5 space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Delivery Address
                </h3>
                <div className="text-[10px] uppercase tracking-widest text-muted leading-relaxed">
                  <p className="font-bold text-foreground mb-1">
                    {order.user?.fullName}
                  </p>
                  <p>{order.shippingAddress?.street}</p>
                  <p>
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state}
                  </p>
                  <p>{order.shippingAddress?.postalCode}</p>
                  <p>{order.shippingAddress?.country}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 md:p-6 border-t border-gray-200 bg-[#FAFAFA] flex items-center justify-end gap-4 mt-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3.5 bg-transparent border border-gray-200 text-foreground text-[10px] font-bold uppercase tracking-widest hover:border-foreground transition-colors duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || newStatus === order.status}
            className="px-8 py-3.5 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              "Update Status"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
