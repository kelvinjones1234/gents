import React from 'react'
import Main from './components/Main'
import { getStorefrontData } from '@/app/actions/storefront'

// Revalidate data every 60 seconds
export const revalidate = 60; 

const HomePage = async () => {
  const { 
    newArrivals, 
    hotDeals, 
    featuredProducts, 
    topSellers, 
    featuredCategories, // <--- New Data for Tabs
    allCategories       // <--- New Data for Category Grid
  } = await getStorefrontData();

  return (
    <div className=''>
      <Main 
        newArrivals={newArrivals}
        hotDeals={hotDeals}
        featuredProducts={featuredProducts}
        topSellers={topSellers}
        featuredCategories={featuredCategories}
        allCategories={allCategories}
      />
    </div>
  )
}

export default HomePage