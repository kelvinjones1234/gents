import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. Import your Providers
import { AuthProvider } from "./(general)/components/Providers";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Update this to reflect your brand!
export const metadata: Metadata = {
  title: "Akinaura",
  description: "Premium essentials and gear for the modern gentlemen.",
  icons: {
    icon: "/logo.png", 
    apple: "/logo.png",
  },
  openGraph: {
    images: ["/logo.png"], 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* 2. Wrap the app: Auth first, then Cart, then Children */}
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
