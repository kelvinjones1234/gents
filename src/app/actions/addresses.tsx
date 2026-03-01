"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// Helper to get or create a profile for the logged-in user
async function getOrCreateProfile() {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user) throw new Error("User not found");

  if (user.profile) return user.profile;

  // Create profile if it doesn't exist
  return await prisma.profile.create({
    data: { userId: user.id },
  });
}

export async function getUserAddresses() {
  try {
    const profile = await getOrCreateProfile();
    const addresses = await prisma.address.findMany({
      where: { profileId: profile.id },
      orderBy: { isDefault: 'desc' } // Put default address first
    });
    return { success: true, addresses };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveAddress(data: {
  id?: string;
  tag: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}) {
  try {
    const profile = await getOrCreateProfile();

    if (data.id) {
      // Update existing
      const updated = await prisma.address.update({
        where: { id: data.id, profileId: profile.id }, // Ensure it belongs to them
        data: {
          tag: data.tag,
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
        },
      });
      return { success: true, address: updated };
    } else {
      // Create new
      const created = await prisma.address.create({
        data: {
          profileId: profile.id,
          tag: data.tag || "Home",
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
        },
      });
      return { success: true, address: created };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}