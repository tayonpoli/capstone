import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, PackageCheckIcon, PackageIcon, PackageMinusIcon, PackageXIcon, Info } from "lucide-react"
import { Purchase, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportGenerator } from "@/components/reports/ReportGenerator"
import { formatIDR } from "@/lib/formatCurrency"

async function getData(): Promise<any[]> {
    try {
        const purchase = await prisma.purchaseOrder.findMany({
            include: {
                supplier: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                purchaseDate: 'desc'
            }
        })

        return purchase

    } catch (error) {
        console.error('Error fetching data:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

async function getStats() {
    try {

        const supplier = await prisma.supplier.count();
        // Total jumlah transaksi sales
        const totalTransactions = await prisma.purchaseOrder.count();

        // Total transaksi yang completed
        const completedTransactions = await prisma.purchaseOrder.count({
            where: {
                status: "Completed"
            }
        });

        // Menghitung total revenue dari sales order yang completed
        const expenseResult = await prisma.purchaseOrder.aggregate({
            where: {
                status: "Completed"
            },
            _sum: {
                total: true
            }
        });

        const totalExpense = expenseResult._sum.total || 0;

        // Menghitung rata-rata nilai transaksi
        const averageTransactionValue = completedTransactions > 0
            ? totalExpense / completedTransactions
            : 0;

        return {
            supplier,
            totalTransactions,
            completedTransactions,
            totalExpense,
            averageTransactionValue
        };
    } catch (error) {
        console.error('Error fetching sales stats:', error);
        return {
            totalTransactions: 0,
            completedTransactions: 0,
            totalRevenue: 0,
            averageTransactionValue: 0
        };
    } finally {
        await prisma.$disconnect();
    }
}

export default async function page() {
    const data = await getData();
    const stats = await getStats();

    return (
        <div className="min-h-screen m-3 p-5 bg-white rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="text-3xl font-semibold pl-1">
                    Purchase
                </div>
                <div className="flex justify-end">
                    <ReportGenerator reportType="purchasing" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Purchases
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatIDR(stats.totalExpense)}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Purchase Transaction
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
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
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp 45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="completed" className="py-8">
                <div className="flex justify-between">
                    <TabsList className="grid w-[400px] grid-cols-2">
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="receivable">Receivable</TabsTrigger>
                    </TabsList>
                    <Link href='/purchase/create'>
                        <Button>
                            <PlusIcon /> Create New Purchase
                        </Button>
                    </Link>
                </div>
                <TabsContent value="completed" className="space-y-2">
                    <div className="container mx-auto py-2">
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
                            ]}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}