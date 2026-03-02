"use server";

import prisma from "@/lib/prisma"; // Adjust this path to your Prisma client
import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    // 3. Securely calculate prices from the Database
    const productIds = cartItems.map((item) => item.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true } // Include variants to verify variant prices if needed
    });

    let calculatedTotal = 0;
    const orderItemsData = cartItems.map((cartItem) => {
      const product = dbProducts.find((p) => p.id === cartItem.productId);
      if (!product) throw new Error(`Product missing: ${cartItem.productId}`);

      let priceToUse = product.discountPrice || product.basePrice;

      // If a variant was selected, use the variant's specific price
      if (cartItem.variantId) {
        const variant = product.variants.find(v => v.id === cartItem.variantId);
        if (variant) {
          priceToUse = variant.price; 
        }
      }

      calculatedTotal += priceToUse * cartItem.quantity;

      return {
        productId: product.id,
        quantity: cartItem.quantity,
        price: priceToUse,
        variantId: cartItem.variantId || null // Capture the variant ID for the order history and stock deduction
      };
    });

    // 4. Create Order, Payment, and Deduct Stock in ONE Transaction
    const order = await prisma.$transaction(async (tx) => {
      const orderNumber = `GENTS-${Math.floor(100000 + Math.random() * 900000)}`;

      // A. Create the Order & Payment
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          totalAmount: calculatedTotal,
          status: "PROCESSING", 
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

      // B. Deduct Stock safely
      for (const item of orderItemsData) {
        if (item.variantId) {
          // Deduct from the specific variant (e.g., Red, Size XL)
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          // Deduct from the main product if there are no variants
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    return { success: true, orderId: order.orderNumber };
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { success: false, error: "An error occurred while processing your order." };
  }
}