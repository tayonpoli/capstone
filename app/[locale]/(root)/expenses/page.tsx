import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"
import { ExpensesDataTable } from "./columns"
import { prisma } from "@/lib/prisma"
import { formatIDR } from "@/lib/formatCurrency"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreateExpense } from "@/components/expenses/CreateExpense"
import { getTranslations } from "next-intl/server"
import { Expenses } from "@/types/expenses"
import { ReportGenerator } from "@/components/reports/ReportGenerator"

async function getData(): Promise<Expenses[]> {
    try {
        const expenses = await prisma.expenses.findMany({
            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true
                    }
                },
            },
            orderBy: {
                expenseDate: 'desc'
            }
        })
        return expenses
    } catch (error) {
        console.error('Error fetching data:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

async function getExpenseStats() {
    try {

        const supplier = await prisma.supplier.count();

        const totalTransactions = await prisma.expenses.count();

        const expenseResult = await prisma.expenses.aggregate({
            where: {
                paymentStatus: "Paid"
            },
            _sum: {
                total: true
            }
        });

        const totalExpense = expenseResult._sum.total || 0;


        const payable = await prisma.expenses.aggregate({
            where: {
                paymentStatus: "Unpaid"
            },
            _sum: {
                total: true
            }
        });

        const totalPayable = payable._sum.total || 0;

        return {
            supplier,
            totalTransactions,
            totalExpense,
            totalPayable,
        };
    } catch (error) {
        console.error('Error fetching sales stats:', error);
        return {
            supplier: 0,
            totalTransactions: 0,
            totalExpense: 0,
            totalPayable: 0,
        };
    } finally {
        await prisma.$disconnect();
    }
}

export default async function page() {
    const session = await getServerSession(authOptions);

    const allowedRoles = ['Admin', 'Owner'];

    // Jika tidak ada session, redirect ke login
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    if (!allowedRoles.includes(session.user.role)) {
        redirect("/unauthorized")
    }

    const t = await getTranslations('expenses');

    const isStaff = session?.user.role === 'Staff'

    const data = await getData();
    const stats = await getExpenseStats();

    const suppliers = await prisma.supplier.findMany({
        orderBy: {
            name: 'asc',
        },
    });

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="pl-1">
                    <p className='text-sm font-light text-gray-400'>
                        Purchasing
                    </p>
                    <h1 className='text-3xl font-semibold'>
                        {t('title')}
                    </h1>
                </div>
                {!isStaff && (
                    <div className="flex justify-end">
                        <CreateExpense suppliers={suppliers} />
                    </div>
                )}
            </div>
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid md:grid-cols-2 xl:grid-cols-4 gap-4 px-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('card.expenses')}
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatIDR(stats.totalExpense)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('card.payable')}
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatIDR(stats.totalPayable)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('card.transaction')}
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('card.vendor')}
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.supplier}</div>
                    </CardContent>
                </Card>
            </div>
            <div className="container mx-auto mt-8 py-2">
                <div className="flex justify-end">
                    {!isStaff && (
                        <ReportGenerator reportType="expenses" />
                    )}
                </div>
                <ExpensesDataTable data={data} />
            </div>
        </div>
    )
}