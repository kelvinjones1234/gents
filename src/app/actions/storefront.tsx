// "use server";

// import prisma from "@/lib/prisma";

// export async function getStorefrontData() {
//   try {
//     const [newArrivals, hotDeals, featuredProducts, topSellers, featuredCategories, allCategories] = await Promise.all([
      
//       // 1. New Arrivals
//       prisma.product.findMany({
//         where: { isNewArrival: true, isActive: true },
//         take: 8,
//         orderBy: { createdAt: "desc" },
//         include: { categories: true }
//       }),

//       // 2. Hot Deals
//       prisma.product.findMany({
//         where: { isHotDeal: true, isActive: true },
//         take: 8,
//         orderBy: { updatedAt: "desc" }, 
//         include: { categories: true }
//       }),

//       // 3. Featured Products (The actual items shown inside the tabs)
//       prisma.product.findMany({
//         where: { isFeatured: true, isActive: true },
//         take: 100, 
//         include: { 
//           categories: true,
//           variants: { select: { stock: true } } 
//         }
//       }),

//       // 4. Top Sellers (UPDATED: Filter by isTopSeller flag)
//       prisma.product.findMany({
//         where: { 
//           isTopSeller: true, // <--- CHANGED FROM STOCK SORT TO BOOLEAN CHECK
//           isActive: true 
//         },
//         take: 8,
//         orderBy: { updatedAt: "desc" }, // Shows recently flagged items first
//         include: { categories: true }
//       }),
      
//       // 5. Featured Categories
//       prisma.category.findMany({
//         where: { isFeatured: true, isActive: true },
//         orderBy: { name: 'asc' }
//       }),

//       // 6. All Active Categories
//       prisma.category.findMany({
//         where: { isActive: true },
//         take: 6, 
//         include: { _count: { select: { products: true } } },
//         orderBy: { products: { _count: 'desc' } }
//       })
//     ]);

//     return { 
//       newArrivals, 
//       hotDeals, 
//       featuredProducts, 
//       topSellers, 
//       featuredCategories,
//       allCategories
//     };

//   } catch (error) {
//     console.error("Failed to fetch storefront data:", error);
//     return { 
//       newArrivals: [], hotDeals: [], featuredProducts: [], topSellers: [], featuredCategories: [], allCategories: [] 
//     };
//   }
// }

// // --- Fetch products when tab is clicked ---
// export async function getProductsByCategory(categoryId: string) {
//   try {
//     if (categoryId === "All") {
//       return await prisma.product.findMany({
//         where: { isFeatured: true, isActive: true },
//         take: 12,
//         include: { 
//           categories: true,
//           variants: { select: { stock: true } } 
//         }
//       });
//     }

//     return await prisma.product.findMany({
//       where: { 
//         categoryIds: { has: categoryId },
//         isActive: true 
//       },
//       take: 12,
//       include: { 
//         categories: true,
//         variants: { select: { stock: true } } 
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching category products:", error);
//     return [];
//   }
// }


"use server";

import prisma from "@/lib/prisma";

// Helper to include full variant details
const productInclude = {
  categories: true,
  variants: true, // Fetch full variant object (id, color, size, price, stock, sku)
};

export async function getStorefrontData() {
  try {
    const [newArrivals, hotDeals, featuredProducts, topSellers, featuredCategories, allCategories] = await Promise.all([
      // 1. New Arrivals
      prisma.product.findMany({
        where: { isNewArrival: true, isActive: true },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: productInclude
      }),

      // 2. Hot Deals
      prisma.product.findMany({
        where: { isHotDeal: true, isActive: true },
        take: 8,
        orderBy: { updatedAt: "desc" },
        include: productInclude
      }),

      // 3. Featured Products
      prisma.product.findMany({
        where: { isFeatured: true, isActive: true },
        take: 100, 
        include: productInclude
      }),

      // 4. Top Sellers
      prisma.product.findMany({
        where: { isTopSeller: true, isActive: true },
        take: 8,
        orderBy: { updatedAt: "desc" },
        include: productInclude
      }),
      
      // 5. Featured Categories
      prisma.category.findMany({
        where: { isFeatured: true, isActive: true },
        orderBy: { name: 'asc' }
      }),

      // 6. All Categories
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

export async function getProductsByCategory(categoryId: string) {
  try {
    if (categoryId === "All") {
      return await prisma.product.findMany({
        where: { isFeatured: true, isActive: true },
        take: 12,
        include: productInclude
      });
    }

    return await prisma.product.findMany({
      where: { 
        categoryIds: { has: categoryId },
        isActive: true 
      },
      take: 12,
      include: productInclude
    });
  } catch (error) {
    console.error("Error fetching category products:", error);
    return [];
  }
}