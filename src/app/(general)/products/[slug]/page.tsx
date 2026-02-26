import { notFound } from "next/navigation";
import { 
  getProductBySlug, 
  getRelatedProducts 
} from "@/app/actions/general/productdetails";
import Main from "./components/Main";

// 1. Wrap the params object in a Promise
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  // 2. Await the params before using them
  const resolvedParams = await params;

  // 3. Fetch the main product using the awaited slug
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) { 
    notFound();
  }

  // 4. Extract category IDs from the fetched product
  const categoryIds = product.categories.map((cat) => cat.id);

  // 5. Fetch up to 4 related products
  const relatedProducts = await getRelatedProducts(product.id, categoryIds);

  // 6. Pass both to the Client Component
  return <Main product={product} relatedProducts={relatedProducts} />;
}