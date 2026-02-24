"use server";

import prisma from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; 

// --- 1. GET CUSTOMERS ---
export async function getCustomers(page = 1, limit = 10, search = "") {
  try {
    const skip = (page - 1) * limit;
    
    // Search across name, email, or location
    const whereClause = search ? {
      OR: [
        { fullName: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { location: { contains: search, mode: "insensitive" as const } }
      ]
    } : {};

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { profile: true } // Include nested profile data (phone)
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return { success: true, customers, total };
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return { success: false, error: "Failed to fetch customer records." };
  }
}

// --- 2. CREATE CUSTOMER ---
export async function createCustomer(formData: FormData) {
  try {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const location = formData.get("location") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as "ADMIN" | "CUSTOMER";
 
    if (!fullName || !email || !password || !location) {
      return { success: false, error: "Required fields are missing." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "User with this email already exists." };
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User & Nested Profile concurrently
    await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        location,
        role: role || "CUSTOMER",
        isActive: true,
        profile: {
          create: {
            phone: phone || undefined,
          }
        }
      },
    });

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create user:", error);
    return { success: false, error: "Internal server error. Please try again." };
  }
}

// --- 3. UPDATE CUSTOMER ---
export async function updateCustomer(id: string, formData: FormData) {
  try {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const location = formData.get("location") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as "ADMIN" | "CUSTOMER";

    // Check email uniqueness if email was changed
    const duplicateUser = await prisma.user.findFirst({
      where: { email, id: { not: id } },
    });
    if (duplicateUser) return { success: false, error: "Email is already in use." };

    // Update User and UPSERT Profile (create if missing, update if exists)
    await prisma.user.update({
      where: { id },
      data: {
        fullName,
        email,
        location,
        role,
        profile: {
          upsert: {
            create: { phone },
            update: { phone }
          }
        }
      },
    });

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { success: false, error: "Failed to update user." };
  }
}

// --- 4. TOGGLE ACTIVE STATUS ---
export async function toggleUserStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.user.update({
      where: { id },
      data: { isActive: !currentStatus },
    });
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update account status." };
  }
}

// --- 5. DELETE CUSTOMER ---
export async function deleteUser(id: string) {
  try {
    // Delete User (Cascade will automatically delete linked Profile & Addresses based on your schema)
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete user account." };
  }
}