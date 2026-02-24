"use server";

import prisma from "@/lib/prisma"; 
import { uploadImage } from "@/lib/cloudinary"; 
import { revalidatePath } from "next/cache";

// --- 1. CREATE CATEGORY ---
export async function createCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    // Convert string "true" to boolean true
    const isFeatured = formData.get("isFeatured") === "true";
    const file = formData.get("image") as File | null;
 
    if (!name || !slug) {
      return { success: false, error: "Name and Slug are required." };
    }

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return { success: false, error: "A category with this slug already exists." };
    }

    let imageUrl = null;
    if (file && file.size > 0) {
      const uploadResult = await uploadImage(file, "gents_collection/categories");
      imageUrl = uploadResult.url;
    }

    await prisma.category.create({
      data: {
        name,
        slug,
        description,
        isFeatured, // Added field
        image: imageUrl,
        isActive: true, // Default to true on creation
      },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Internal server error. Please try again." };
  }
}

// --- 2. GET CATEGORIES (WITH PAGINATION & SEARCH) ---
export async function getCategories(page = 1, limit = 5, search = "") {
  try {
    const skip = (page - 1) * limit;
    const whereClause = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: { createdAt: "desc" }, 
      }),
      prisma.category.count({ where: whereClause }),
    ]);

    return { success: true, categories, total };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { success: false, error: "Failed to fetch categories." };
  }
}

// --- 3. TOGGLE ACTIVE STATUS ---
export async function toggleCategoryStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.category.update({
      where: { id },
      data: { isActive: !currentStatus },
    });
    
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle status:", error);
    return { success: false, error: "Failed to update category status." };
  }
}

// --- 4. DELETE CATEGORY ---
export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ 
      where: { id },
    });
    
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category." };
  }
}

// --- 5. UPDATE CATEGORY ---
export async function updateCategory(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const isFeatured = formData.get("isFeatured") === "true"; // Added field
    const file = formData.get("image") as File | null;

    if (!name || !slug) {
      return { success: false, error: "Name and Slug are required." };
    }

    // Check if another category (not this one) uses the same slug
    const duplicateSlug = await prisma.category.findFirst({
      where: { 
        slug,
        id: { not: id } 
      },
    });

    if (duplicateSlug) {
      return { success: false, error: "This slug is already in use by another category." };
    }

    let imageUrl = undefined; // Undefined means Prisma won't update the field
    if (file && file.size > 0) {
      const uploadResult = await uploadImage(file, "gents_collection/categories");
      imageUrl = uploadResult.url;
    }

    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        isFeatured, // Added field
        ...(imageUrl && { image: imageUrl }), 
      },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category." };
  }
}



export async function toggleCategoryFeatured(id: string, currentStatus: boolean) {
  try {
    await prisma.category.update({
      where: { id },
      data: { isFeatured: !currentStatus },
    });
    
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle featured status:", error);
    return { success: false, error: "Failed to update featured status." };
  }
}