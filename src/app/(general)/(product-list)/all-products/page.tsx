import React from 'react';
import Main from './components/Main';
import { getAllProducts } from '@/app/actions/general/productcategories';
export const dynamic = "force-dynamic";

const AllProductsPage = async () => {
  const initialProducts = await getAllProducts();

  return (
    <Main initialProducts={initialProducts as any} />
  );
}

export default AllProductsPage;