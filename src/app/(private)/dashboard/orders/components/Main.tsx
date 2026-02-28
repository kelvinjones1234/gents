"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Loader2,
  Package,
  CreditCard,
  Calendar,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useToast } from "@/context/ToastContext";

// Imported actions and modal
import { getOrders } from "@/app/actions/admin/order";
import ViewOrderModal from "./ViewOrderModal"; // <-- UNCOMMENTED

const ITEMS_PER_PAGE = 10;

export default function Main() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const viewOrderId = searchParams.get("view");

  // --- STATE ---
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // --- DERIVED DATA (SEARCH & PAGINATION) ---
  // Moved up so handlers have access to the calculated arrays
  const filteredOrders = orders.filter((o) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(searchLower) ||
      o.user?.fullName?.toLowerCase().includes(searchLower) ||
      o.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // --- FETCH DATA ---
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const result = await getOrders();
      // Add the fallback `|| []` to satisfy TypeScript
      if (result.success && result.orders) {
        setOrders(result.orders);
      } else {
        toast(result.error || "Failed to load orders.", "error");
      }
    } catch (error) {
      toast("An unexpected error occurred.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!viewOrderId) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewOrderId]);

  // Reset to page 1 if the search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- HANDLERS ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedOrders(paginatedOrders.map((o) => o.id));
    else setSelectedOrders([]);
  };

  const handleSelectOrder = (id: string) => {
    if (selectedOrders.includes(id))
      setSelectedOrders(selectedOrders.filter((oId) => oId !== id));
    else setSelectedOrders([...selectedOrders, id]);
  };

  // --- NAVIGATION ---
  const closeView = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    router.push(`${pathname}?${params.toString()}`);
    fetchOrders(); // Refresh order status upon closing the modal
  };

  // --- UI HELPERS ---
  const getOrderStatusBadge = (status: string) => {
    const base =
      "inline-flex items-center px-2 py-1 text-[8px] font-bold uppercase tracking-widest border";
    switch (status) {
      case "DELIVERED":
        return `${base} bg-green-50 text-green-700 border-green-200`;
      case "SHIPPED":
        return `${base} bg-blue-50 text-blue-700 border-blue-200`;
      case "PROCESSING":
        return `${base} bg-orange-50 text-orange-700 border-orange-200`;
      case "CANCELLED":
        return `${base} bg-red-50 text-red-700 border-red-200`;
      default:
        return `${base} bg-gray-50 text-gray-700 border-gray-200`; // PENDING
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const base =
      "inline-flex items-center gap-1 px-2 py-1 text-[8px] font-bold uppercase tracking-widest border";
    switch (status) {
      case "SUCCESS":
        return `${base} bg-green-50 text-green-700 border-green-200`;
      case "FAILED":
      case "REFUNDED":
        return `${base} bg-red-50 text-red-700 border-red-200`;
      default:
        return `${base} bg-orange-50 text-orange-700 border-orange-200`; // PENDING
    }
  };

  // --- RENDER VIEWS ---
  // <-- UNCOMMENTED MODAL VIEW
  if (viewOrderId) {
    return <ViewOrderModal orderId={viewOrderId} onClose={closeView} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-lg font-medium tracking-tight uppercase text-foreground">
            Orders
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">
            Manage transactions and fulfillment
          </p>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="bg-white border border-gray-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="w-full md:max-w-md relative flex items-center">
          <Search
            className="w-4 h-4 text-muted absolute left-4"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="SEARCH BY ORDER # OR CUSTOMER"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-gray-200 text-[9px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground focus:bg-white transition-colors placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 3. TABLE / LIST */}
      <div className="bg-white border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <Loader2 className="w-8 h-8 text-muted animate-spin mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
              Loading Orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <Package className="w-8 h-8 text-gray-300 mb-4" strokeWidth={1} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
              No orders found.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#FAFAFA]">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-foreground cursor-pointer"
                        checked={
                          selectedOrders.length === paginatedOrders.length &&
                          paginatedOrders.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted">
                      Order Details
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted">
                      Customer
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted">
                      Amount
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted">
                      Payment
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted">
                      Fulfillment
                    </th>
                    <th className="py-4 px-4 text-[9px] font-bold uppercase tracking-widest text-muted text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedOrders.map((order) => {
                    const paymentStatus = order.payment?.status || "PENDING";
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-[#FAFAFA] transition-colors group"
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-foreground cursor-pointer"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                              {order.orderNumber}
                            </span>
                            <span className="text-[9px] uppercase tracking-widest text-muted mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" strokeWidth={1.5} />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground line-clamp-1">
                              {order.user?.fullName || "Guest"}
                            </span>
                            <span className="text-[9px] uppercase tracking-widest text-muted mt-1">
                              {order.user?.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[11px] font-bold tabular-nums text-foreground">
                          ₦{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={getPaymentStatusBadge(paymentStatus)}
                          >
                            <CreditCard className="w-3 h-3" />
                            {paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={getOrderStatusBadge(order.status)}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                const p = new URLSearchParams(
                                  searchParams.toString(),
                                );
                                p.set("view", order.id);
                                router.push(`${pathname}?${p.toString()}`);
                              }}
                              className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest border border-gray-200 text-foreground hover:bg-foreground hover:text-white transition-colors"
                            >
                              Manage
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW */}
            <div className="lg:hidden flex flex-col divide-y divide-gray-100">
              {paginatedOrders.map((order) => {
                const paymentStatus = order.payment?.status || "PENDING";

                return (
                  <div
                    key={order.id}
                    className="p-4 flex flex-col gap-4 relative"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-foreground cursor-pointer"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                        />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                            {order.orderNumber}
                          </span>
                          <span className="text-[9px] uppercase tracking-widest text-muted mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold tabular-nums text-foreground">
                        ₦{order.totalAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-3 bg-gray-50 p-3 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-widest text-muted">
                          Customer
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">
                          {order.user?.fullName || "Guest"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-widest text-muted">
                          Payment
                        </span>
                        <span className={getPaymentStatusBadge(paymentStatus)}>
                          {paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-widest text-muted">
                          Status
                        </span>
                        <span className={getOrderStatusBadge(order.status)}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          const p = new URLSearchParams(
                            searchParams.toString(),
                          );
                          p.set("view", order.id);
                          router.push(`${pathname}?${p.toString()}`);
                        }}
                        className="w-full flex justify-center items-center gap-2 py-3 text-[9px] font-bold uppercase tracking-widest text-foreground border border-foreground hover:bg-foreground hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> Manage
                        Order
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4. PAGINATION FOOTER */}
            {filteredOrders.length > 0 && (
              <div className="p-4 md:p-6 border-t border-gray-200 bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted">
                  Showing {startIndex + 1}-
                  {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of{" "}
                  {totalItems} Orders
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-200 text-[9px] font-bold uppercase tracking-widest disabled:opacity-30 transition-colors hover:border-foreground"
                  >
                    Prev
                  </button>
                  <span className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="px-3 py-2 border border-gray-200 text-[9px] font-bold uppercase tracking-widest disabled:opacity-30 transition-colors hover:border-foreground"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
