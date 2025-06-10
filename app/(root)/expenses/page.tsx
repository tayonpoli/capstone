import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, Info } from "lucide-react"
import { Expenses, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import { formatIDR } from "@/lib/formatCurrency"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ExpenseForm } from "@/components/expenses/CreateExpense"

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

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

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
                        Expenses List
                    </h1>
                </div>
                {!isStaff && (
                    <div className="flex justify-end">
                        <Dialog modal={false}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusIcon /> Create New Expenses
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Expense Details</DialogTitle>
                                </DialogHeader>
                                <ExpenseForm suppliers={suppliers} />
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Expenses
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
                            Account Payable
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
                            Expenses Transaction
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
                            Suppliers
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.supplier}</div>
                    </CardContent>
                </Card>
            </div>
            <div className="container mx-auto mt-8 py-2">
                <DataTable
                    columns={columns}
                    data={data}
                    searchColumn="supplierName"
                    searchPlaceholder="Search supplier ..."
                    facetedFilters={[
                        {
                            columnId: "paymentStatus",
                            title: "Status",
                            options: [
                                { label: "Paid", value: "Paid" },
                                { label: "Unpaid", value: "Unpaid" },
                            ],
                        },
                        {
                            columnId: "category",
                            title: "Category",
                            options: [
                                { label: "Electricity", value: "Electricity" },
                                { label: "Unpaid", value: "Unpaid" },
                            ],
                        },
                    ]}
                />
            </div>
        </div>
    )
}