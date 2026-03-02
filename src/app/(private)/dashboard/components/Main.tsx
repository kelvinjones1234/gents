"use client";

import {
  Activity,
  CreditCard,
  Users,
  Package,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

// Define the expected prop types based on our server action
type DashboardProps = {
  initialData: {
    stats: {
      totalRevenue: string;
      activeOrders: number;
      totalCustomers: number;
      lowStockCount: number;
    };
    recentOrders: Array<{
      id: string;
      customer: string;
      date: string;
      amount: string;
      status: string;
    }>;
    lowStockProducts: Array<{
      id: string;
      name: string;
      sku: string | null;
      stock: number;
    }>;
  };
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "text-foreground border-foreground";
    case "SHIPPED":
    case "PROCESSING":
      return "text-muted border-gray-300";
    case "PENDING":
      return "text-amber-600 border-amber-200 bg-amber-50";
    case "CANCELLED":
      return "text-red-600 border-red-200 bg-red-50";
    default:
      return "text-muted border-gray-200";
  }
};

export default function Main({ initialData }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Map the dynamic data to your stats array structure
  const dynamicStats = [
    {
      id: 1,
      label: "Total Revenue",
      value: initialData.stats.totalRevenue,
      increase: "Live", // Can be calculated by comparing to last month's data
      icon: CreditCard,
    },
    {
      id: 2,
      label: "Active Orders",
      value: initialData.stats.activeOrders.toString(),
      increase: "Live",
      icon: Activity,
    },
    {
      id: 3,
      label: "Total Customers",
      value: initialData.stats.totalCustomers.toString(),
      increase: "Live",
      icon: Users,
    },
    {
      id: 4,
      label: "Low Stock Items",
      value: initialData.stats.lowStockCount.toString(),
      increase:
        initialData.stats.lowStockCount > 0 ? "Needs Action" : "Optimal",
      icon: AlertCircle,
      isAlert: initialData.stats.lowStockCount > 0,
    },
  ];

  return (
    <div className="bg-background text-foreground font-sans antialiased min-h-screen flex flex-col transition-colors duration-300">
      {/* 1. DASHBOARD HEADER */}
      <header className="pb-8 border-b border-gray-200 ">
        <div className="flex justify-between gap-6 items-center">
          <div>
            <h1 className="font-display text-lg sm:text-xl md:text-2xl font-medium tracking-tight uppercase leading-[0.9]">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-foreground text-white border border-foreground text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-transparent hover:text-foreground transition-colors">
              New Product
            </button>
          </div>
        </div>
      </header>

      {/* 2. KPI METRICS GRID */}
      <section className="border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {dynamicStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="p-6 md:p-8 hover:bg-[#FAFAFA] transition-colors group"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted">
                    {stat.label}
                  </h3>
                  <Icon
                    className={`w-4 h-4 ${stat.isAlert ? "text-red-500" : "text-gray-400"} group-hover:text-foreground transition-colors`}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-display text-3xl md:text-4xl font-medium tracking-tight">
                    {stat.value}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${stat.isAlert ? "text-red-500" : "text-green-600 flex items-center gap-1"}`}
                  >
                    {!stat.isAlert && <TrendingUp className="w-3 h-3" />}
                    {stat.increase}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <section className="flex-1 bg-[#FAFAFA] py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: RECENT ORDERS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Recent Transactions
                </h2>
                <p className="text-[10px] text-muted tracking-wide uppercase mt-1">
                  Latest 5 orders across all channels
                </p>
              </div>
              <a
                href="/admin/orders"
                className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5"
              >
                View All Orders
              </a>
            </div>

            <div className="border border-gray-200 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#FAFAFA]">
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted">
                      Order ID
                    </th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted">
                      Customer
                    </th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted">
                      Date
                    </th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted text-right">
                      Amount
                    </th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {initialData.recentOrders.length > 0 ? (
                    initialData.recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        <td className="p-4 text-xs font-bold text-foreground">
                          {order.id}
                        </td>
                        <td className="p-4 text-xs text-muted group-hover:text-foreground transition-colors">
                          {order.customer}
                        </td>
                        <td className="p-4 text-[10px] text-muted uppercase tracking-wider">
                          {order.date}
                        </td>
                        <td className="p-4 text-xs font-bold text-foreground text-right">
                          {order.amount}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 border text-[9px] font-bold uppercase tracking-widest ${getStatusStyle(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-xs text-muted uppercase tracking-widest"
                      >
                        No recent orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN: ALERTS & INVENTORY */}
          <div className="lg:col-span-4 space-y-12">
            {/* INVENTORY ALERT WIDGET */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                <Package className="w-4 h-4" /> Inventory Alerts
              </h2>
              <div className="border border-gray-200 divide-y divide-gray-100">
                {initialData.lowStockProducts.length > 0 ? (
                  initialData.lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-foreground">
                          {product.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${product.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {product.stock === 0
                            ? "Out of Stock"
                            : `${product.stock} Left`}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted uppercase tracking-widest">
                        SKU: {product.sku || "N/A"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[10px] text-muted uppercase tracking-widest">
                    Stock levels are optimal.
                  </div>
                )}

                <div className="p-4 bg-[#FAFAFA]">
                  <a
                    href="/admin/inventory"
                    className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-muted transition-colors"
                  >
                    Manage Inventory <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS WIDGET */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center gap-3 p-6 border border-gray-200 hover:border-foreground hover:bg-foreground hover:text-white transition-all group">
                  <CreditCard className="w-5 h-5 text-muted group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-center">
                    Process
                    <br />
                    Refunds
                  </span>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-6 border border-gray-200 hover:border-foreground hover:bg-foreground hover:text-white transition-all group">
                  <Users className="w-5 h-5 text-muted group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-center">
                    Manage
                    <br />
                    Customers
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
