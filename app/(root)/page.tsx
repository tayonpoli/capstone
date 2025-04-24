import { LineCharts } from "@/components/charts/LineChart";
import { LongChart } from "@/components/charts/LongChart";
import { PieCharts } from "@/components/charts/PieChart";
import RevenueChart from "@/components/charts/RevenueChart";
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation";

const page = async () => {
  const session = await getServerSession(authOptions);
  console.log(session);
  if (session?.user) {
    return (
      <div className=" m-3 p-5 bg-white rounded-md">
        <div className="p-3">
          <p className="text-sm text-gray-500">
            Dashboard
          </p>
          <h1 className="font-semibold text-3xl">
            Business Overview
          </h1>
        </div>
        <div className='space-y-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4 items-start p-3'>
          <div className="col-span-3">
            <LongChart />
          </div>
          <div>
            <PieCharts />
          </div>
          <div className="col-span-2">
            <RevenueChart />
          </div>
          <div>
            <LineCharts />
          </div>
        </div>
      </div>
    )
  } else {
    redirect("/api/auth/signin")
  }
}

export default page