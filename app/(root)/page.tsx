import { LongChart } from "@/components/charts/LongChart";
import { RecentTransactions } from "@/components/charts/RecentPurchase";
import { DailySalesChart } from "@/components/charts/RevenueChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation";
import { getSalesStats } from "./sales/page";
import { formatIDR } from "@/lib/formatCurrency";
import { getPurchaseStats } from "./purchase/page";
import SalesAnalysis from "@/components/ai/SalesAnalysis";


const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const salesStats = await getSalesStats();
  const stats = await getPurchaseStats();

  return (
    <div className="m-3 mb-0 pb-0 p-5 rounded-md">
      <div className="grid grid-cols-2 p-3">
        <div>
          <p className="text-sm text-gray-500">
            Dashboard
          </p>
          <h1 className="font-semibold text-3xl">
            Business Overview
          </h1>
        </div>
        <div className="flex justify-end">
          <SalesAnalysis />
        </div>
      </div>
      {/* <div className="p-3">
        <p className="text-sm text-gray-500">
          Dashboard
        </p>
        <h1 className="font-semibold text-3xl">
          Business Overview
        </h1>
      </div> */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-4 p-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            Rp
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(salesStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From current sales orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            Rp
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(stats.totalExpense)}</div>
            <p className="text-xs text-muted-foreground">
              From expenses and purchase orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Receivable
            </CardTitle>
            Rp
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(salesStats.totalReceivable)}</div>
            <p className="text-xs text-muted-foreground">
              Of the current sales orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Payable
            </CardTitle>
            Rp
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(stats.totalPayable)}</div>
            <p className="text-xs text-muted-foreground">
              On the current purchase orders
            </p>
          </CardContent>
        </Card>
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