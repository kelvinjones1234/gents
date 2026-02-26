import React from "react";
import { notFound } from "next/navigation";
import Main from "./components/Main";
import { getCategoryBySlug } from "@/app/actions/general/productcategories";

// Ensure dynamic rendering to catch DB changes
export const dynamic = "force-dynamic";

// 1. Change params to a Promise
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
} 

const CategoryPage = async ({ params }: PageProps) => {
  // 2. Await the params to get the slug
  const { slug } = await params;

  const categoryData = await getCategoryBySlug(slug);

  if (!categoryData) {
    return notFound();
  }

  return <Main categoryData={categoryData as any} />;
};

export default CategoryPage;