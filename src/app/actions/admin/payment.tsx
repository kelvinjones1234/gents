// app/actions/admin/payment.ts
"use server";

import prisma from "@/lib/prisma";

export async function getPaginatedPayments(page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;

    // Run count and fetch in parallel
    const [totalPayments, payments] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            select: {
              orderNumber: true,
              user: {
                select: { fullName: true, email: true }
              }
            }
          }
        }
      })
    ]);

    const totalPages = Math.ceil(totalPayments / limit);

    // Format the data for the client
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      reference: payment.reference,
      amount: new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(payment.amount),
      provider: payment.provider,
      status: payment.status,
      date: new Intl.DateTimeFormat("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(payment.createdAt),
      orderNumber: payment.order?.orderNumber || "N/A",
      customerName: payment.order?.user.fullName || "Unknown",
      customerEmail: payment.order?.user.email || "N/A",
    }));

    return { 
      success: true, 
      payments: formattedPayments, 
      totalPages,
      currentPage: page
    };
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return { success: false, error: "Failed to load payment transactions." };
  }
}