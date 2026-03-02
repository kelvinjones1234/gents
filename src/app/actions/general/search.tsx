"use server";

import prisma from "@/lib/prisma";

export async function searchProducts(query: string) {
  if (!query || query.trim().length < 2) {
    return { success: true, products: [] };
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        categories: true,
        variants: true,
      },
      take: 4, // Limit to 4 results for the dropdown layout
    });

    return { success: true, products };
  } catch (error: any) {
    console.error("Search error:", error);
    return { success: false, products: [] };
  }
}