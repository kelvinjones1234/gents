"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Package,
  MapPin,
  HelpCircle,
  LogOut,
  ChevronRight,
  Clock,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { getUserProfileData } from "@/app/actions/general/account";
import { saveAddress, deleteAddress } from "@/app/actions/addresses"; // Adjust this import path if needed
import { useToast } from "@/context/ToastContext";

export default function Main() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "orders" | "addresses" | "support"
  >("orders");

  // --- DYNAMIC STATE ---
  const [userData, setUserData] = useState<{
    fullName: string;
    orders: any[];
    addresses: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- ADDRESS FORM STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tag: "",
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
    postalCode: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await getUserProfileData();
      if (result.success && result.user) {
        setUserData(result.user as any);
      } else {
        toast(result.error || "Failed to load account data.", "error");
      }
    } catch (error) {
      toast("An unexpected error occurred.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/account/login" });
  };

  // --- ADDRESS HANDLERS ---
  const openAddressModal = (address?: any) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        tag: address.tag,
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode,
      });
    } else {
      setEditingId(null);
      setFormData({
        tag: "",
        street: "",
        city: "",
        state: "",
        country: "Nigeria",
        postalCode: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await saveAddress({
        id: editingId || undefined,
        ...formData,
      });
      if (res.success) {
        toast(
          editingId
            ? "Address updated successfully"
            : "Address added successfully",
          "success",
        );
        setIsModalOpen(false);
        fetchData(); // Refresh the data list
      } else {
        toast(res.error || "Failed to save address", "error");
      }
    } catch (error) {
      toast("An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const promptDeleteAddress = (id: string) => {
    setAddressToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteAddress = async () => {
    if (!addressToDelete) return;

    setIsDeleting(true);
    try {
      const res = await deleteAddress(addressToDelete);
      if (res.success) {
        toast("Address deleted successfully", "success");
        fetchData(); // Refresh the data list
        setIsDeleteModalOpen(false);
        setAddressToDelete(null);
      } else {
        toast(res.error || "Failed to delete address", "error");
      }
    } catch (error) {
      toast("An unexpected error occurred", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && !userData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-foreground animate-spin mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
          Loading your account...
        </p>
      </div>
    );
  }

  // Fallback name if DB data isn't loaded
  const firstName =
    userData?.fullName?.split(" ")[0] ||
    session?.user?.name?.split(" ")[0] ||
    "Gent";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative">
      {/* HEADER SECTION */}
      <section className="bg-[#FAFAFA] border-b border-gray-200 pt-16 pb-10">
        <div className="container-main mx-auto px-6 md:px-12">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">
            My Account
          </h2>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-medium leading-[0.9] tracking-tight text-foreground uppercase">
            Welcome Back,{" "}
            {firstName}
          </h1>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <section className="py-16">
        <div className="container-main mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-12 lg:gap-24">
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-full md:w-64 flex-shrink-0">
            {/* Mobile Tab Scroller */}
            <div className="md:hidden flex overflow-x-auto hide-scrollbar gap-6 border-b border-gray-200 pb-4 mb-8">
              {[
                { id: "orders", label: "Order History", icon: Package },
                { id: "addresses", label: "Addresses", icon: MapPin },
                { id: "support", label: "Support", icon: HelpCircle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 flex-shrink-0 text-[10px] font-bold uppercase tracking-widest pb-2 border-b-2 transition-all duration-300 ${
                    activeTab === tab.id
                      ? "text-foreground border-foreground"
                      : "text-muted border-transparent hover:text-foreground hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Desktop Vertical Menu */}
            <nav className="hidden md:flex flex-col space-y-2">
              {[
                { id: "orders", label: "Order History", icon: Package },
                { id: "addresses", label: "Addresses", icon: MapPin },
                { id: "support", label: "Support", icon: HelpCircle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-between px-4 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 border-l-2 ${
                    activeTab === tab.id
                      ? "border-foreground bg-[#FAFAFA] text-foreground"
                      : "border-transparent text-muted hover:bg-[#FAFAFA] hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </div>
                  {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}

              <div className="pt-8 mt-8 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-red-600 transition-colors duration-300 group"
                >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  Logout
                </button>
              </div>
            </nav>
          </aside>

          {/* CONTENT AREA */}
          <div className="flex-1 min-w-0">
            {/* --- ORDER HISTORY TAB --- */}
            {activeTab === "orders" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-display text-xl md:text-2xl tracking-tight uppercase mb-8 pb-4 border-b border-gray-200">
                  Order History
                </h2>

                {!userData?.orders || userData.orders.length === 0 ? (
                  <p className="text-[10px] uppercase tracking-widest text-muted leading-relaxed">
                    You haven't placed any orders yet.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {userData.orders.map((order) => {
                      const firstItem = order.items?.[0];
                      const displayImage =
                        firstItem?.product?.images?.[0] ||
                        "https://placehold.co/150x150";

                      return (
                        <div
                          key={order.id}
                          className="border border-gray-200 bg-white group hover:border-foreground transition-colors duration-300"
                        >
                          {/* Order Header */}
                          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAFAFA]">
                            <div className="flex flex-wrap items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-muted">
                              <div>
                                <span className="block text-foreground mb-1">
                                  Order Number
                                </span>
                                {order.orderNumber}
                              </div>
                              <div>
                                <span className="block text-foreground mb-1">
                                  Date Placed
                                </span>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="block text-foreground mb-1">
                                  Total Amount
                                </span>
                                <span className="text-foreground">
                                  ₦{order.totalAmount.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-[9px] font-bold uppercase tracking-widest bg-white">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${order.status === "DELIVERED" ? "bg-green-500" : order.status === "CANCELLED" ? "bg-red-500" : "bg-orange-500 animate-pulse"}`}
                              ></span>
                              {order.status}
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-6">
                              <div className="w-20 h-24 bg-gray-100 flex-shrink-0 border border-gray-200">
                                <img
                                  src={displayImage}
                                  alt={firstItem?.product?.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground leading-relaxed line-clamp-1">
                                  {firstItem?.product?.name ||
                                    "Product Unavailable"}
                                </h3>
                                {(firstItem?.variant?.color ||
                                  firstItem?.variant?.size) && (
                                  <p className="text-[9px] uppercase tracking-widest text-muted mt-1">
                                    {firstItem.variant.color}{" "}
                                    {firstItem.variant.color &&
                                    firstItem.variant.size
                                      ? "/"
                                      : ""}{" "}
                                    {firstItem.variant.size}
                                  </p>
                                )}
                                {order.items.length > 1 && (
                                  <p className="text-[9px] font-bold text-foreground mt-2">
                                    + {order.items.length - 1} MORE ITEM(S)
                                  </p>
                                )}
                              </div>
                            </div>

                            <button className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-transparent border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors duration-300">
                              View Order
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* --- ADDRESSES TAB --- */}
            {activeTab === "addresses" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-200 gap-4">
                  <h2 className="font-display text-xl md:text-2xl tracking-tight uppercase">
                    Saved Addresses
                  </h2>
                  <button
                    onClick={() => openAddressModal()}
                    className="px-6 py-3 border border-foreground bg-foreground text-white text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300"
                  >
                    Add New Address
                  </button>
                </div>

                {!userData?.addresses || userData.addresses.length === 0 ? (
                  <p className="text-[10px] uppercase tracking-widest text-muted leading-relaxed">
                    You haven't saved any addresses yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-gray-200 p-6 flex flex-col relative group hover:border-foreground transition-colors duration-300 bg-[#FAFAFA] hover:bg-white"
                      >
                        {address.isDefault && (
                          <span className="absolute top-0 right-0 bg-foreground text-white px-3 py-1 text-[8px] font-bold uppercase tracking-widest">
                            Default
                          </span>
                        )}

                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground mb-4">
                          {address.tag || userData.fullName}
                        </h3>

                        <div className="text-[10px] uppercase tracking-widest text-muted leading-relaxed flex-1 space-y-1">
                          <p>{address.street}</p>
                          <p>
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p>{address.country}</p>
                        </div>

                        <div className="mt-8 flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest">
                          <button
                            onClick={() => openAddressModal(address)}
                            className="border-b border-foreground pb-0.5 hover:text-muted hover:border-muted transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => promptDeleteAddress(address.id)}
                            className="border-b border-transparent text-muted pb-0.5 hover:text-red-600 hover:border-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- SUPPORT TAB --- */}
            {activeTab === "support" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-display text-xl md:text-2xl tracking-tight uppercase mb-8 pb-4 border-b border-gray-200">
                  Client Services
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-[#FAFAFA] border border-gray-200 p-8 flex flex-col items-start gap-4">
                    <Clock className="w-6 h-6 text-foreground" />
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground mb-2">
                        Live Chat
                      </h3>
                      <p className="text-sm text-muted leading-relaxed mb-6">
                        Speak directly with our client advisors. Available
                        Monday through Friday, 9AM to 6PM WAT.
                      </p>
                    </div>
                    <button className="mt-auto px-8 py-4 bg-transparent border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors duration-300 w-full text-center">
                      Start Conversation
                    </button>
                  </div>

                  <div className="bg-[#FAFAFA] border border-gray-200 p-8 flex flex-col items-start gap-4">
                    <HelpCircle className="w-6 h-6 text-foreground" />
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground mb-2">
                        Email Support
                      </h3>
                      <p className="text-sm text-muted leading-relaxed mb-6">
                        Send us a message and we will get back to you within 24
                        business hours.
                      </p>
                    </div>
                    <button className="mt-auto px-8 py-4 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 w-full text-center">
                      Send Email
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-6">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {[
                      "Shipping & Delivery Timelines",
                      "Returns & Exchanges Policy",
                      "Warranty Information",
                      "Product Care Guide",
                    ].map((faq, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center justify-between p-6 border border-gray-200 hover:border-foreground group transition-colors duration-300"
                      >
                        <span className="text-xs font-bold uppercase tracking-widest text-foreground">
                          {faq}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted group-hover:text-foreground group-hover:translate-x-2 transition-all duration-300" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- ADDRESS MODAL OVERLAY --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 w-full max-w-lg p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
              <h2 className="font-display text-xl uppercase tracking-tight text-foreground">
                {editingId ? "Edit Address" : "New Address"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="ADDRESS TAG (E.G. HOME, OFFICE)"
                  value={formData.tag}
                  onChange={(e) =>
                    setFormData({ ...formData, tag: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="STREET ADDRESS"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="CITY"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="STATE"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="POSTAL CODE"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="COUNTRY"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-transparent border border-gray-300 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 px-6 py-4 border border-foreground bg-foreground text-white text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Saving..." : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAddressToDelete(null);
        }}
        onConfirm={executeDeleteAddress}
        title="Delete Address"
        description="Are you sure you want to delete this address? This action cannot be undone and it will be removed from your account."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}