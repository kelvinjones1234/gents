import { notFound } from "next/navigation";
import { 
  getProductBySlug, 
  getRelatedProducts 
} from "@/app/actions/general/productdetails";
import Main from "./components/Main";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: PageProps) {
  // 1. Fetch the main product
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // 2. Extract category IDs from the fetched product
  const categoryIds = product.categories.map((cat) => cat.id);

  // 3. Fetch up to 4 related products
  const relatedProducts = await getRelatedProducts(product.id, categoryIds);

  // 4. Pass both to the Client Component
  return <Main product={product} relatedProducts={relatedProducts} />;
}