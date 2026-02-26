"use server";

import { prisma } from "@/lib/prisma"; // Adjust based on your prisma client location

export async function getHotDeals() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isHotDeal: true,
        isActive: true,
      },
      include: {
        categories: true,
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching hot deals:", error);
    return [];
  }
}






export async function getNewArrivals() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isNewArrival: true,
        isActive: true,
      },
      include: {
        categories: true,
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching hot deals:", error);
    return [];
  }
}




export async function getAllProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        categories: true,
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}






export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { 
        slug: slug,
        isActive: true 
      },
      include: {
        products: {
          where: { isActive: true },
          include: {
            variants: true,
            categories: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!category) return null;

    return category;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}