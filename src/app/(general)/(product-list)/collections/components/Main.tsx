import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// --- METADATA ---
export const metadata = {
  title: "Collections | Gent",
  description: "Explore our curated collections of premium men's wear.",
};

// --- SERVER COMPONENT ---
export default async function Main() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });

  if (categories.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 bg-[#FAFAFA] px-4 text-center">
        <h1 className="font-display text-2xl uppercase tracking-widest">
          No Collections Found
        </h1>
        <p className="text-muted text-sm max-w-md">
          We are currently updating our catalog. Please check back later.
        </p>
        <Link
          href="/"
          className="px-8 py-4 bg-foreground text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground font-sans antialiased selection:bg-black selection:text-white">
      {/* HERO HEADER */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container-main mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-24 flex flex-col items-center text-center space-y-4 sm:space-y-6">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight uppercase leading-[0.9]">
            Our Collections
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-lg leading-relaxed">
            A curated selection of our finest pieces, meticulously categorized
            for the modern gentleman. Discover timeless aesthetics and
            uncompromising quality.
          </p>
        </div>
      </section>

      {/* EDITORIAL LAYOUT */}
      <section className="flex flex-col">
        {categories.map((category, index) => {
          const isEven = index % 2 === 0;

          return (
            <article
              key={category.id}
              className={`flex flex-col lg:flex-row w-full border-b border-gray-200 group ${
                isEven ? "" : "lg:flex-row-reverse"
              }`}
            >
              {/* IMAGE HALF */}
              <div className="w-full lg:w-1/2 relative overflow-hidden bg-[#EFEFEF] aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[70vh]">
                <img
                  src={category.image || "/placeholder.png"}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />

                {category.isFeatured && (
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 text-[9px] font-bold uppercase tracking-widest z-10">
                    Featured Collection
                  </div>
                )}

                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* TEXT HALF */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center items-start p-6 sm:p-10 md:p-14 lg:p-16 xl:p-24 bg-white relative">
                {/* Number Indicator */}
                <span className="hidden sm:block absolute top-6 right-6 sm:top-8 sm:right-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="max-w-md w-full">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <span className="h-[1px] w-6 sm:w-8 bg-foreground flex-shrink-0"></span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted">
                      {category._count.products} Exclusive Pieces
                    </span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-medium tracking-tight uppercase leading-[0.9] mb-4 sm:mb-6 text-foreground transition-colors duration-500 group-hover:text-gray-600">
                    {category.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-muted leading-relaxed mb-7 sm:mb-10">
                    {category.description ||
                      "Immerse yourself in the latest additions to this collection. Tailored fits, premium fabrics, and a distinct approach to modern menswear."}
                  </p>

                  <Link
                    href={`/collections/${category.slug}`}
                    className="inline-flex items-center gap-3 sm:gap-4 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-foreground pb-2 hover:text-muted hover:border-muted transition-all duration-300 active:text-muted active:border-muted"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
