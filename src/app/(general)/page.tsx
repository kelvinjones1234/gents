import React from "react";
import Main from "./components/Main";
import { getStorefrontData } from "@/app/actions/general/storefront";

// Revalidate data every 60 seconds

const HomePage = async () => {
  const {
    newArrivals,
    hotDeals,
    featuredProducts,
    topSellers,
    featuredCategories, // <--- New Data for Tabs
    allCategories, // <--- New Data for Category Grid
  } = await getStorefrontData();

  return (
    <div className="">
      <Main
        newArrivals={newArrivals}
        hotDeals={hotDeals}
        featuredProducts={featuredProducts}
        topSellers={topSellers}
        featuredCategories={featuredCategories}
        allCategories={allCategories}
      />
    </div>
  );
};

export default HomePage;
