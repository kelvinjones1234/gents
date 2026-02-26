"use server";

import { prisma } from "@/lib/prisma";
import { Product, ProductVariant, Category, Review } from "@prisma/client";

// Define a type for the full product return so your frontend gets perfect autocomplete
export type FullProductDetails = Product & {
  variants: ProductVariant[];
  categories: Category[];
  reviews: (Review & { user: { fullName: string } })[];
};

export async function getProductBySlug(
  slug: string,
): Promise<FullProductDetails | null> {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
        isActive: true, // Only fetch active products
      },
      include: {
        categories: true,
        variants: true,
        reviews: {
          include: {
            user: {
              select: { fullName: true }, // We only need the user's name for the review
            },
          },
          orderBy: {
            createdAt: "desc", // Newest reviews first
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    return product as FullProductDetails;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw new Error("Failed to fetch product details");
  }
}

export type ProductWithRelations = Product & {
  categories: Category[];
  variants: ProductVariant[];
};

export async function getRelatedProducts(
  currentProductId: string,
  categoryIds: string[],
): Promise<ProductWithRelations[]> {
  try {
    const relatedProducts = await prisma.product.findMany({
      where: {
        isActive: true, // Only show active products
        id: {
          not: currentProductId, // Exclude the product currently being viewed
        },
        categories: {
          some: {
            id: {
              in: categoryIds, // Must share at least one category
            },
          },
        },
      },
      take: 4, // Limit to 4 products max
      include: {
        categories: true,
        variants: true, // Required by your ProductCard component to calculate stock/prices
      },
    });

    return relatedProducts;
  } catch (error) {
    console.error("Error fetching related products:", error);
    return []; // Return an empty array on error so the page doesn't crash
  }
}
