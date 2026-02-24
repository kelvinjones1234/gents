import { NextResponse } from "next/server";
import bcrypt from "bcrypt"; // Note: if this still crashes after this fix, swap to 'bcryptjs'
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Extract the exact fields sent from the frontend
    const { fullName, email, password, location } = await req.json();

    // 2. Validate everything is present
    if (!fullName || !email || !password || !location) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 3. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user matching your schema exactly
    const user = await prisma.user.create({
      data: {
        fullName, // matches your schema
        email,    // matches your schema
        password: hashedPassword,
        location, // matches your schema and is required
      },
    });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    // IMPORTANT: Actually log the error so we can see it in the terminal if it fails!
    console.error("REGISTRATION ERROR: ", error); 
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}