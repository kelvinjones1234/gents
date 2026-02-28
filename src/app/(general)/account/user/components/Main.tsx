"use client";

import { useState } from "react";
import {
  Package,
  MapPin,
  HelpCircle,
  LogOut,
  ChevronRight,
  Clock,
  ArrowRight,
} from "lucide-react";

// --- Mock Data ---
const MOCK_ORDERS = [
  {
    id: "#ORD-2026-0892",
    date: "OCT 24, 2026",
    total: 145000,
    status: "DELIVERED",
    items: [
      {
        name: "THE STEALTH BACKPACK",
        variant: "MATTE BLACK",
        price: 145000,
        image: "/img1.png",
      },
    ],
  },
  {
    id: "#ORD-2026-0714",
    date: "SEP 12, 2026",
    total: 85000,
    status: "PROCESSING",
    items: [
      {
        name: "TITANIUM EDC KNIFE",
        variant: "SILVER",
        price: 85000,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      },
    ],
  },
];

const MOCK_ADDRESSES = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    street: "14B Admiralty Way, Lekki Phase 1",
    city: "Lagos",
    state: "LA",
    zip: "105102",
    country: "Nigeria",
    isDefault: true,
  },
  {
    id: "2",
    firstName: "John",
    lastName: "Doe",
    street: "Block 4, Flat 2, 1004 Estates",
    city: "Victoria Island",
    state: "LA",
    zip: "101241",
    country: "Nigeria",
    isDefault: false,
  },
];

export default function Main() {
  const [activeTab, setActiveTab] = useState<
    "orders" | "addresses" | "support"
  >("orders");

  const handleLogout = () => {
    // Implement actual logout logic here
    console.log("User logged out");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* HEADER SECTION */}
      <section className="bg-[#FAFAFA] border-b border-gray-200 pt-24 pb-16">
        <div className="container-main mx-auto px-6 md:px-12">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">
            My Account
          </h2>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium leading-[0.9] tracking-tight text-foreground uppercase">
            Welcome Back,
            <br />
            John
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
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 flex-shrink-0 text-[10px] font-bold uppercase tracking-widest pb-2 text-red-600 hover:text-red-800"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
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
                  Logout securely
                </button>
              </div>
            </nav>
          </aside>

          {/* CONTENT AREA */}
          <div className="flex-1 min-w-0">
            {/* --- ORDER HISTORY TAB --- */}
            {activeTab === "orders" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-display text-2xl md:text-3xl tracking-tight uppercase mb-8 pb-4 border-b border-gray-200">
                  Order History
                </h2>

                {MOCK_ORDERS.length === 0 ? (
                  <p className="text-sm text-muted leading-relaxed">
                    You haven't placed any orders yet.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {MOCK_ORDERS.map((order) => (
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
                              {order.id}
                            </div>
                            <div>
                              <span className="block text-foreground mb-1">
                                Date Placed
                              </span>
                              {order.date}
                            </div>
                            <div>
                              <span className="block text-foreground mb-1">
                                Total Amount
                              </span>
                              <span className="text-foreground">
                                ₦{order.total.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-[9px] font-bold uppercase tracking-widest bg-white">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${order.status === "DELIVERED" ? "bg-green-500" : "bg-orange-500 animate-pulse"}`}
                            ></span>
                            {order.status}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-24 bg-[#EFEFEF] flex-shrink-0">
                              <img
                                src={order.items[0].image}
                                alt={order.items[0].name}
                                className="w-full h-full object-cover mix-blend-multiply"
                              />
                            </div>
                            <div>
                              <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground leading-relaxed line-clamp-1">
                                {order.items[0].name}
                              </h3>
                              <p className="text-[10px] uppercase tracking-widest text-muted mt-1">
                                {order.items[0].variant}
                              </p>
                              {order.items.length > 1 && (
                                <p className="text-[10px] text-muted mt-2 font-medium">
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
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- ADDRESSES TAB --- */}
            {activeTab === "addresses" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-200 gap-4">
                  <h2 className="font-display text-2xl md:text-3xl tracking-tight uppercase">
                    Saved Addresses
                  </h2>
                  <button className="px-6 py-3 bg-foreground text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors duration-300">
                    Add New Address
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {MOCK_ADDRESSES.map((address) => (
                    <div
                      key={address.id}
                      className="border border-gray-200 p-6 flex flex-col relative group hover:border-foreground transition-colors duration-300"
                    >
                      {address.isDefault && (
                        <span className="absolute top-0 right-0 bg-foreground text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest">
                          Default
                        </span>
                      )}

                      <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">
                        {address.firstName} {address.lastName}
                      </h3>

                      <div className="text-sm text-muted leading-relaxed flex-1 space-y-1">
                        <p>{address.street}</p>
                        <p>
                          {address.city}, {address.state} {address.zip}
                        </p>
                        <p>{address.country}</p>
                      </div>

                      <div className="mt-8 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                        <button className="border-b border-foreground pb-0.5 hover:text-muted hover:border-muted transition-colors">
                          Edit
                        </button>
                        <button className="border-b border-transparent text-muted pb-0.5 hover:text-red-600 hover:border-red-600 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- SUPPORT TAB --- */}
            {activeTab === "support" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-display text-2xl md:text-3xl tracking-tight uppercase mb-8 pb-4 border-b border-gray-200">
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

                {/* FAQ Quick Links */}
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
    </div>
  );
}
