import React from 'react';
import Main from './components/Main';
import { getHotDeals } from '@/app/actions/general/productcategories';
// Force dynamic ensures we always have fresh deals from the DB
export const dynamic = "force-dynamic";

const HotDealsPage = async () => {
  const initialProducts = await getHotDeals();

  return (
    <Main initialProducts={initialProducts as any} />
  );
}

export default HotDealsPage;