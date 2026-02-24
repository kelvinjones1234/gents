"use server";

import prisma from "@/lib/prisma";

export async function getStorefrontData() {
  try {
    const [newArrivals, hotDeals, featuredProducts, topSellers, featuredCategories, allCategories] = await Promise.all([
      
      // 1. New Arrivals
      prisma.product.findMany({
        where: { isNewArrival: true, isActive: true },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { categories: true }
      }),

      // 2. Hot Deals
      prisma.product.findMany({
        where: { isHotDeal: true, isActive: true },
        take: 8,
        orderBy: { updatedAt: "desc" },
        include: { categories: true }
      }),

      // 3. Featured Products (The actual items shown inside the tabs)
      // We fetch a larger pool (100) to ensure every Featured Category tab has items to show
      prisma.product.findMany({
        where: { isFeatured: true, isActive: true },
        take: 100, 
        include: { 
          categories: true,
          variants: { select: { stock: true } } 
        }
      }),

      // 4. Top Sellers
      prisma.product.findMany({
        where: { isActive: true },
        take: 8,
        orderBy: { stock: 'asc' }, 
        include: { categories: true }
      }),
      
      // 5. FEATURED CATEGORIES (The Tabs)
      // This fetches ALL categories flagged as isFeatured = true
      prisma.category.findMany({
        where: { isFeatured: true, isActive: true },
        orderBy: { name: 'asc' }
      }),

      // 6. All Active Categories (For the grid layout below Hero)
      prisma.category.findMany({
        where: { isActive: true },
        take: 6, 
        include: { _count: { select: { products: true } } },
        orderBy: { products: { _count: 'desc' } }
      })
    ]);

    return { 
      newArrivals, 
      hotDeals, 
      featuredProducts, 
      topSellers, 
      featuredCategories,
      allCategories
    };

  } catch (error) {
    console.error("Failed to fetch storefront data:", error);
    return { 
      newArrivals: [], hotDeals: [], featuredProducts: [], topSellers: [], featuredCategories: [], allCategories: [] 
    };
  }
}



// --- NEW FUNCTION: Fetch products when tab is clicked ---
export async function getProductsByCategory(categoryId: string) {
  try {
    // If "All", fetch generic featured items
    if (categoryId === "All") {
      return await prisma.product.findMany({
        where: { isFeatured: true, isActive: true },
        take: 12,
        include: { 
          categories: true,
          variants: { select: { stock: true } } 
        }
      });
    }

    // Otherwise, fetch by specific Category ID
    return await prisma.product.findMany({
      where: { 
        categoryIds: { has: categoryId },
        isActive: true 
      },
      take: 12,
      include: { 
        categories: true,
        variants: { select: { stock: true } } 
      }
    });
  } catch (error) {
    console.error("Error fetching category products:", error);
    return [];
  }
}