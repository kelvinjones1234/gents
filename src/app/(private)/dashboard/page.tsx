import { getDashboardData } from "@/app/actions/admin/dashboard";
import Main from "./components/Main";

// 1. Tell Next.js NOT to prerender this page at build time
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch data on the server (now happens at request time, not build time)
  const dashboardData = await getDashboardData();

  // Pass data to the client component
  return <Main initialData={dashboardData} />;
}