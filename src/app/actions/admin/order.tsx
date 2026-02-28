// app/actions/admin/order.ts
"use server";
import prisma from "@/lib/prisma";

export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, email: true } },
        payment: true, // gets the payment status
      },
    });
    return { success: true, orders };
  } catch (error) {
    return { success: false, error: "Failed to fetch orders" };
  }
}

export async function getOrderById(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { fullName: true, email: true, profile: true },
        },
        payment: true,
        items: {
          include: {
            product: { select: { name: true, sku: true, images: true } },
            variant: true,
          },
        },
      },
    });
    if (!order) return { success: false, error: "Order not found." };
    return { success: true, order };
  } catch (error) {
    return { success: false, error: "Database error." };
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status as any }, // 'as any' bypasses TS strict enum complaints, or import OrderStatus from Prisma
    });
    return { success: true, order: updatedOrder };
  } catch (error) {
    return { success: false, error: "Failed to update order status." };
  }
}
