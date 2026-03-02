"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDashboardData() {
  try {
    // 1. Total Revenue (Sum of all orders that aren't cancelled)
    const revenueAgg = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "CANCELLED" } },
    });
    const totalRevenue = revenueAgg._sum.totalAmount || 0;

    // 2. Active Orders (Pending or Processing)
    const activeOrders = await prisma.order.count({
      where: { status: { in: ["PENDING", "PROCESSING"] } },
    });

    // 3. Total Customers
    const totalCustomers = await prisma.user.count({
      where: { role: "CUSTOMER" },
    });

    // 4. Low Stock Items (Products with no variants and stock <= 5)
    // Note: You can expand this to check ProductVariant stock as well
    const lowStockThreshold = 5;
    const lowStockProducts = await prisma.product.findMany({
      where: {
        hasVariants: false,
        stock: { lte: lowStockThreshold },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
      },
      take: 5,
    });
    
    const lowStockCount = await prisma.product.count({
      where: { hasVariants: false, stock: { lte: lowStockThreshold } },
    });

    // 5. Recent Orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { fullName: true },
        },
      },
    });

    // Format Data for the Client
    const formattedOrders = recentOrders.map((order) => ({
      id: order.orderNumber, // Assuming orderNumber is formatted like "ORD-7392"
      customer: order.user.fullName,
      date: new Intl.DateTimeFormat("en-NG", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(order.createdAt),
      amount: new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(order.totalAmount),
      status: order.status,
    }));

    return {
      stats: {
        totalRevenue: new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          maximumFractionDigits: 0,
        }).format(totalRevenue),
        activeOrders,
        totalCustomers,
        lowStockCount,
      },
      recentOrders: formattedOrders,
      lowStockProducts,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    throw new Error("Could not load dashboard data");
  }
}