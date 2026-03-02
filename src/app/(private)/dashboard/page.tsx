import { getDashboardData } from "@/app/actions/admin/dashboard";
import Main from "./components/Main";


export default async function AdminDashboardPage() {
  // Fetch data on the server
  const dashboardData = await getDashboardData();

  // Pass data to the client component
  return <Main initialData={dashboardData} />;
}