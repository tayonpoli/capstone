import { LongChart } from "@/components/charts/LongChart";
import { RecentTransactions } from "@/components/charts/RecentPurchase";
import { DailySalesChart } from "@/components/charts/RevenueChart";
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  // Jika tidak ada session, redirect ke login
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="m-3 mb-0 pb-0 p-5 bg-white rounded-md">
      <div className="p-3">
        <p className="text-sm text-gray-500">
          Dashboard
        </p>
        <h1 className="font-semibold text-3xl">
          Business Overview
        </h1>
      </div>
      <div className='space-y-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4 items-start p-3'>
        <div className="col-span-4">
          <LongChart />
        </div>
        <div className="col-span-2">
          <DailySalesChart />
        </div>
        <div className="col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage