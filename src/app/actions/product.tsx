"use server";

import prisma from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  try {
    // 1. Extract Base Product Data
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;

    // Flags
    const hasVariants = formData.get("hasVariants") === "true";
    const isActive = formData.get("isActive") === "true";
    const isFeatured = formData.get("isFeatured") === "true";
    const isHotDeal = formData.get("isHotDeal") === "true";
    const isNewArrival = formData.get("isNewArrival") === "true";

    // Pricing
    const basePrice = parseFloat(formData.get("basePrice") as string);
    const discountPriceStr = formData.get("discountPrice") as string;
    const discountPrice = discountPriceStr
      ? parseFloat(discountPriceStr)
      : undefined;

    // Simple Product Fields (Will be null if hasVariants is true)
    const sku = formData.get("sku") as string | null;
    const stock = parseInt((formData.get("stock") as string) || "0", 10);

    // 2. Validate Uniqueness
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });
    if (existingProduct) {
      return {
        success: false,
        error: "A product with this slug already exists.",
      };
    }

    if (!hasVariants && sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku } });
      if (existingSku)
        return { success: false, error: "This SKU is already in use." };
    }

    // 3. Handle Main Images Upload
    const imageFiles = formData.getAll("images") as File[];
    const uploadedMainImageUrls: string[] = [];

    for (const file of imageFiles) {
      if (file.size > 0) {
        const uploadResult = await uploadImage(
          file,
          "gents_collection/products",
        );
        uploadedMainImageUrls.push(uploadResult.url);
      }
    }

    // 4. Process Variants (If Applicable)
    let variantsToCreate = [];
    if (hasVariants) {
      const variantsDataStr = formData.get("variantsData") as string;
      const parsedVariants = JSON.parse(variantsDataStr);

      for (const variant of parsedVariants) {
        // Check if a specific image was uploaded for this variant
        const variantImageFile = formData.get(
          `variantImage_${variant.id}`,
        ) as File | null;
        let variantImageUrl = undefined;

        if (variantImageFile && variantImageFile.size > 0) {
          const uploadResult = await uploadImage(
            variantImageFile,
            "gents_collection/products/variants",
          );
          variantImageUrl = uploadResult.url;
        }

        // Validate Variant SKU
        const existingVariantSku = await prisma.productVariant.findUnique({
          where: { sku: variant.sku },
        });
        if (existingVariantSku) {
          return {
            success: false,
            error: `Variant SKU '${variant.sku}' is already in use.`,
          };
        }

        variantsToCreate.push({
          color: variant.color || undefined,
          size: variant.size || undefined,
          sku: variant.sku,
          price: parseFloat(variant.price),
          stock: parseInt(variant.stock || "0", 10),
          image: variantImageUrl,
        });
      }
    }

    // 5. Save to Database (Prisma Nested Write)
    await prisma.product.create({
      data: {
        name,
        slug,
        description,
        basePrice,
        discountPrice,
        sku: hasVariants ? undefined : sku,
        stock: hasVariants ? 0 : stock,
        hasVariants,
        images: uploadedMainImageUrls,
        isActive,
        isFeatured,
        isHotDeal,
        isNewArrival,
        categories: {
          connect: { id: categoryId },
        },
        variants: hasVariants
          ? {
              create: variantsToCreate,
            }
          : undefined,
      },
    });

    revalidatePath("/dashboard/products"); // Adjust path to match your actual route
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return {
      success: false,
      error: "Internal server error while creating product.",
    };
  }
}

// --- NEW: FETCH PRODUCTS ---
export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        categories: { select: { name: true } }, // Fetch category names
        variants: { select: { stock: true } }, // Fetch variant stock to calculate total stock
      },
    });

    return { success: true, products };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { success: false, products: [] };
  }
}

// --- NEW: TOGGLE PRODUCT ACTIVE STATUS ---
export async function toggleProductStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false };
  }
}

// --- NEW: FETCH SINGLE PRODUCT FOR EDITING ---
export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: { select: { id: true } },
        variants: true,
      },
    });

    if (!product) return { success: false, error: "Product not found." };
    return { success: true, product };
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return { success: false, error: "Internal server error." };
  }
}

// --- NEW: DELETE PRODUCT ---
export async function deleteProduct(id: string) {
  try {
    // Because of onDelete: Cascade in your schema, this will also delete associated variants
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product." };
  }
}

// --- NEW: UPDATE PRODUCT ---
export async function updateProduct(id: string, formData: FormData) {
  try {
    // 1. Extract Base Data
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;

    const hasVariants = formData.get("hasVariants") === "true";
    const isActive = formData.get("isActive") === "true";
    const isFeatured = formData.get("isFeatured") === "true";
    const isHotDeal = formData.get("isHotDeal") === "true";
    const isNewArrival = formData.get("isNewArrival") === "true";

    const basePrice = parseFloat(formData.get("basePrice") as string);
    const discountPriceStr = formData.get("discountPrice") as string;
    const discountPrice = discountPriceStr
      ? parseFloat(discountPriceStr)
      : undefined;

    const sku = formData.get("sku") as string | null;
    const stock = parseInt((formData.get("stock") as string) || "0", 10);

    // 2. Validate Uniqueness (excluding the current product)
    const existingProduct = await prisma.product.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existingProduct)
      return {
        success: false,
        error: "A product with this slug already exists.",
      };

    if (!hasVariants && sku) {
      const existingSku = await prisma.product.findFirst({
        where: { sku, NOT: { id } },
      });
      if (existingSku)
        return { success: false, error: "This SKU is already in use." };
    }

    // 3. Handle Images (Existing URLs + New Uploads)
    const existingImages = JSON.parse(
      (formData.get("existingImages") as string) || "[]",
    );
    const imageFiles = formData.getAll("newImages") as File[];
    const finalImageUrls: string[] = [...existingImages];

    for (const file of imageFiles) {
      if (file.size > 0) {
        const uploadResult = await uploadImage(
          file,
          "gents_collection/products",
        );
        finalImageUrls.push(uploadResult.url);
      }
    }

    // 4. Process Variants
    let variantsToCreate = [];
    if (hasVariants) {
      const variantsDataStr = formData.get("variantsData") as string;
      const parsedVariants = JSON.parse(variantsDataStr);

      for (const variant of parsedVariants) {
        let variantImageUrl = variant.existingImage || undefined;
        const variantImageFile = formData.get(
          `variantImage_${variant.id}`,
        ) as File | null;

        if (variantImageFile && variantImageFile.size > 0) {
          const uploadResult = await uploadImage(
            variantImageFile,
            "gents_collection/products/variants",
          );
          variantImageUrl = uploadResult.url;
        }

        // Validate Variant SKU against OTHER products/variants
        const existingVariantSku = await prisma.productVariant.findFirst({
          where: { sku: variant.sku, productId: { not: id } },
        });
        if (existingVariantSku)
          return {
            success: false,
            error: `Variant SKU '${variant.sku}' is already in use by another product.`,
          };

        variantsToCreate.push({
          color: variant.color || undefined,
          size: variant.size || undefined,
          sku: variant.sku,
          price: parseFloat(variant.price),
          stock: parseInt(variant.stock || "0", 10),
          image: variantImageUrl,
        });
      }
    }

    // 5. Update Database
    await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        basePrice,
        discountPrice,
        sku: hasVariants ? undefined : sku,
        stock: hasVariants ? 0 : stock,
        hasVariants,
        images: finalImageUrls,
        isActive,
        isFeatured,
        isHotDeal,
        isNewArrival,
        categories: {
          set: [{ id: categoryId }], // 'set' replaces the existing connections
        },
        // For variants, we clear out the old ones and recreate the new list to ensure sync
        variants: hasVariants
          ? {
              deleteMany: {},
              create: variantsToCreate,
            }
          : {
              deleteMany: {}, // If changed from variants to simple product, wipe old variants
            },
      },
    });

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return {
      success: false,
      error: "Internal server error while updating product.",
    };
  }
}
