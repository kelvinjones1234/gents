// app/actions/user/profile.ts
"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function getUserProfileData() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: {
          include: { addresses: true }
        },
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            payment: true,
            items: {
              include: {
                product: { select: { name: true, images: true } },
                variant: { select: { color: true, size: true } }
              }
            }
          }
        }
      }
    });

    if (!user) return { success: false, error: "User not found" };

    return { 
      success: true, 
      user: {
        fullName: user.fullName,
        email: user.email,
        orders: user.orders,
        addresses: user.profile?.addresses || []
      } 
    };
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return { success: false, error: "Failed to load profile data." };
  }
}