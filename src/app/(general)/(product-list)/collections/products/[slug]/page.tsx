import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Main from "./components/Main"; // Adjust path if your Main component is elsewhere

// 1. Define the new Next.js 15 Promise types for props
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 2. Await the props in generateMetadata
export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const query = searchParams?.q;
  if (query) return { title: `Search: ${query} | Gent` };
  if (params.slug === "all") return { title: "All Products | Gent" };
  
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) return { title: "Collection Not Found | Gent" };
  return { title: `${category.name} | Gent` };
}

// 3. Await the props in the main component
export default async function ProductsSearchPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const slug = params.slug;
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;

  // Build the Database Query dynamically
  const whereClause: any = { isActive: true };

  // If viewing a specific collection (e.g., /collections/products/shirts)
  if (slug !== "all") {
    whereClause.categories = { some: { slug: slug } };
  }

  // If there is a search query (e.g., ?q=blue)
  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  // Fetch the Data
  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      categories: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Determine Page Titles and Descriptions
  let pageTitle = "All Products";
  let pageDesc = "Explore our complete collection of premium menswear. Uncompromising quality and timeless aesthetics.";

  if (query) {
    pageTitle = `Search Results`;
    pageDesc = `Showing results for "${query}"`;
  } else if (slug !== "all") {
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) return notFound(); // Trigger Next.js 404 page if slug is invalid
    pageTitle = category.name;
    pageDesc = category.description || `Explore our ${category.name} collection.`;
  }

  return (
    <div className="bg-background text-foreground font-sans antialiased selection:bg-black selection:text-white pb-24">
      
      {/* BREADCRUMBS & HEADER */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container-main mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-16 flex flex-col items-center text-center space-y-4">
          <nav className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-2">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[150px] sm:max-w-none">
              {query ? `Search: ${query}` : pageTitle}
            </span>
          </nav>
          
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight uppercase px-4">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-lg leading-relaxed pt-2 px-4">
            {pageDesc}
          </p>
        </div>
      </div>

      {/* PRODUCT GRID SECTION */}
      <section className="container-main mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-16">
        
        {/* Toolbar */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
            {products.length} {products.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        {/* Client Component renders the grid */}
        <Main products={products} searchQuery={query} />

      </section>
    </div>
  );
}