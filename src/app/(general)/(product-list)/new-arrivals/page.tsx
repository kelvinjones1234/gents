import React from "react";
import Main from "./components/Main";
import { getNewArrivals } from "@/app/actions/general/productcategories";
export const dynamic = "force-dynamic";

const NewArrivalsPage = async () => {
  const initialProducts = await getNewArrivals();

  return <Main initialProducts={initialProducts as any} />;
};

export default NewArrivalsPage;
