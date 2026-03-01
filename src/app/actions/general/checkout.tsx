"use server";

import prisma from "@/lib/prisma"; // Adjust this path to your Prisma client
import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust to your auth options

export async function verifyAndCreateOrder(
  reference: string,
  cartItems: any[],
  shippingAddress: any
) {
  try {
    // 1. Get the logged-in user
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return { success: false, error: "You must be logged in to checkout." };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return { success: false, error: "User not found." };

    // 2. Verify the transaction directly with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { 
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return { success: false, error: "Payment verification failed." };
    }

    // 3. Securely calculate prices from the Database (Don't trust client cart prices)
    const productIds = cartItems.map((item) => item.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let calculatedTotal = 0;
    const orderItemsData = cartItems.map((cartItem) => {
      const product = dbProducts.find((p) => p.id === cartItem.productId);
      if (!product) throw new Error(`Product missing: ${cartItem.productId}`);

      // If you are using discountPrice, use it, otherwise basePrice
      const priceToUse = product.discountPrice || product.basePrice;
      calculatedTotal += priceToUse * cartItem.quantity;

      return {
        productId: product.id,
        quantity: cartItem.quantity,
        price: priceToUse,
        // variantId: cartItem.variantId || null // Add this if using variants
      };
    });

    // 4. Create the Order, OrderItems, and Payment in a single Transaction
    const order = await prisma.$transaction(async (tx) => {
      // Generate a unique order number (e.g., GENTS-123456)
      const orderNumber = `GENTS-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          totalAmount: calculatedTotal,
          status: "PROCESSING", // Setting to processing because it's already paid
          shippingAddress,
          userId: user.id,
          items: {
            create: orderItemsData,
          },
          payment: {
            create: {
              amount: calculatedTotal,
              provider: "PAYSTACK",
              reference: reference,
              status: "SUCCESS",
            },
          },
        },
      });

      return newOrder;
    });

    return { success: true, orderId: order.orderNumber };
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { success: false, error: "An error occurred while processing your order." };
  }
}