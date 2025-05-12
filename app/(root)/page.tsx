import { LineCharts } from "@/components/charts/LineChart";
import { LongChart } from "@/components/charts/LongChart";
import { PieCharts } from "@/components/charts/PieChart";
import RevenueChart from "@/components/charts/RevenueChart";
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation";

const AdminDashboardPage = async () => {
  const session = await getServerSession(authOptions);

  // Jika tidak ada session, redirect ke login
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Jika user tidak memiliki role admin, redirect ke unauthorized atau home
  if (session.user.role !== 'Admin') {
    redirect("/unauthorized"); // atau redirect("/");
  }

  return (
    <div className="m-3 p-5 bg-white rounded-md">
      <div className="p-3">
        <p className="text-sm text-gray-500">
          Admin Dashboard
        </p>
        <h1 className="font-semibold text-3xl">
          Business Overview
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome, {session.user.name} (Admin)
        </p>
      </div>
      <div className='space-y-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4 items-start p-3'>
        <div className="col-span-4">
          <LongChart />
        </div>
        <div className="col-span-2">
          <RevenueChart />
        </div>
        <div className="h-96">
          <PieCharts />
        </div>
        <div className="h-96">
          <LineCharts />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage