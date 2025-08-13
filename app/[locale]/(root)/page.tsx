import { LongChart } from "@/components/charts/LongChart";
import { RecentTransactions } from "@/components/charts/RecentPurchase";
import { DailySalesChart } from "@/components/charts/RevenueChart";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation";
import { formatIDR } from "@/lib/formatCurrency";
import SalesAnalysis from "@/components/ai/SalesAnalysis";
import { ExpensesPieChart } from "@/components/charts/PieChart";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

async function getSalesStats() {
  try {
    const oneMonth = new Date();
    oneMonth.setDate(oneMonth.getDate() - 30);

    const totalTransactions = await prisma.salesOrder.count({
      where: {
        orderDate: {
          gte: oneMonth
        }
      }
    });

    const revenueResult = await prisma.salesOrder.aggregate({
      where: {
        orderDate: {
          gte: oneMonth
        },
        paymentStatus: "Paid"
      },
      _sum: {
        total: true
      }
    });

    const totalRevenue = revenueResult._sum.total || 0;

    const receivableResult = await prisma.salesOrder.aggregate({
      where: {
        orderDate: {
          gte: oneMonth
        },
        paymentStatus: "Unpaid"
      },
      _sum: {
        total: true
      }
    });

    const totalReceivable = receivableResult._sum.total || 0;

    return {
      totalTransactions,
      totalRevenue,
      totalReceivable,
    };
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    return {
      totalTransactions: 0,
      totalRevenue: 0,
      totalReceivable: 0,
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function getPurchaseStats() {
  try {

    const oneMonth = new Date();
    oneMonth.setDate(oneMonth.getDate() - 30);

    const purchaseResult = await prisma.purchaseOrder.aggregate({
      where: {
        purchaseDate: {
          gte: oneMonth
        },
        paymentStatus: "Paid"
      },
      _sum: {
        total: true
      }
    });

    const totalPurchase = purchaseResult._sum.total || 0;


    const payable = await prisma.purchaseOrder.aggregate({
      where: {
        purchaseDate: {
          gte: oneMonth
        },
        paymentStatus: "Unpaid"
      },
      _sum: {
        total: true
      }
    });

    const totalPayable = payable._sum.total || 0;

    return {
      totalPurchase,
      totalPayable,
    };
  } catch (error) {
    console.error('Error fetching purchase stats:', error);
    return {
      totalPurchase: 0,
      totalPayable: 0,
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function getExpensesStats() {
  try {

    const oneMonth = new Date();
    oneMonth.setDate(oneMonth.getDate() - 30);

    const expensesResult = await prisma.expenses.aggregate({
      where: {
        expenseDate: {
          gte: oneMonth
        }
      },
      _sum: {
        total: true
      }
    });

    const totalExpenses = expensesResult._sum.total || 0;

    const payable = await prisma.expenses.aggregate({
      where: {
        expenseDate: {
          gte: oneMonth
        },
        paymentStatus: "Unpaid"
      },
      _sum: {
        total: true
      }
    });

    const expensePayable = payable._sum.total || 0;


    return {
      totalExpenses,
      expensePayable
    };
  } catch (error) {
    console.error('Error fetching purchase stats:', error);
    return {
      totalExpenses: 0,
      expensePayable: 0
    };
  } finally {
    await prisma.$disconnect();
  }
}

const DashboardPage = async () => {
  const t = await getTranslations('HomePage');
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const isOwner = session.user.role === 'Owner'

  const salesStats = await getSalesStats();
  const stats = await getPurchaseStats();
  const expenses = await getExpensesStats();
  const totalpayable = stats.totalPayable + expenses.expensePayable;

  return (
    <div className="m-3 mb-0 pb-0 px-5 rounded-md">
      <div className="grid grid-cols-2 p-3">
        <div>
          <p className="text-sm text-gray-500">
            {t('title')}
          </p>
          <h1 className="font-semibold text-3xl">
            {t('subTitle')}
          </h1>
        </div>
        {isOwner && (
          <div className="flex justify-end">
            <SalesAnalysis />
          </div>
        )}
      </div>
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid md:grid-cols-2 xl:grid-cols-5 gap-4 px-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>
              {t('revenue.title')}
            </CardTitle>
            <CardAction>
              <Link href={'/sales'}>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{formatIDR(salesStats.totalRevenue)}</div>
            <p className="text-sm text-muted-foreground">
              {t('revenue.desc')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>
              {t('purchases.title')}
            </CardTitle>
            <CardAction>
              <Link href={'/purchase'}>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{formatIDR(stats.totalPurchase)}</div>
            <p className="text-sm text-muted-foreground">
              {t('purchases.desc')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>
              {t('expenses.title')}
            </CardTitle>
            <CardAction>
              <Link href={'/expenses'}>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{formatIDR(expenses.totalExpenses)}</div>
            <p className="text-sm text-muted-foreground">
              {t('expenses.desc')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>
              {t('receivable.title')}
            </CardTitle>
            <CardAction>
              <Link href={'/sales'}>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{formatIDR(salesStats.totalReceivable)}</div>
            <p className="text-sm text-muted-foreground">
              {t('receivable.desc')}
            </p>
          </CardContent>
        </Card>
        <Card className="md:hidden xl:flex">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>
              {t('payable.title')}
            </CardTitle>
            <CardAction>
              <Link href={'/purchase'}>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{formatIDR(totalpayable)}</div>
            <p className="text-sm text-muted-foreground">
              {t('payable.desc')}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className='space-y-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6 my-4 items-start p-3'>
        <div className="col-span-2 xl:col-span-6">
          <LongChart />
        </div>
        <div className="col-span-2">
          <DailySalesChart />
        </div>
        <div className="col-span-2">
          <ExpensesPieChart />
        </div>
        <div className="col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage