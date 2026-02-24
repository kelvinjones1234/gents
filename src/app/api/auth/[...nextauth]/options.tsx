import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/account/login", // Updated to match your folder structure
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }

        // Return the user object, passing only what we need to the JWT
        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // The 'user' object is passed in the very first time the user logs in
      if (user) {
        token.sub = user.id;
        token.role = (user as any).role;
        token.fullName = (user as any).fullName;
      }
      return token;
    },
    async session({ session, token }) {
      // Bind the fields from the JWT token to the active browser session
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).fullName = token.fullName;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};