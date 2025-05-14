import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, PackageCheckIcon, PackageIcon, PackageMinusIcon, PackageXIcon, Info } from "lucide-react"
import { Sales, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatIDR } from "@/lib/formatCurrency"
import { ReportGenerator } from "@/components/reports/ReportGenerator"

async function getData(): Promise<any[]> {
    try {
        const sales = await prisma.salesOrder.findMany({
            include: {
                customer: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                orderDate: 'desc'
            }
        })
        return sales
    } catch (error) {
        console.error('Error fetching data:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

async function getSalesStats() {
    try {
        const customer = await prisma.customer.count();
        // Total jumlah transaksi sales
        const totalTransactions = await prisma.salesOrder.count();

        // Total transaksi yang completed
        const completedTransactions = await prisma.salesOrder.count({
            where: {
                status: "Completed"
            }
        });

        // Menghitung total revenue dari sales order yang completed
        const revenueResult = await prisma.salesOrder.aggregate({
            where: {
                status: "Completed"
            },
            _sum: {
                total: true
            }
        });

        const totalRevenue = revenueResult._sum.total || 0;

        // Menghitung rata-rata nilai transaksi
        const averageTransactionValue = completedTransactions > 0
            ? totalRevenue / completedTransactions
            : 0;

        return {
            customer,
            totalTransactions,
            completedTransactions,
            totalRevenue,
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
    const salesStats = await getSalesStats();

    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="text-3xl font-semibold pl-1">
                    Sales
                </div>
                <div className="flex justify-end">
                    <ReportGenerator reportType="sales" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatIDR(salesStats.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Profit
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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sales Transaction
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesStats.totalTransactions}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Customers
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesStats.customer}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="completed" className="py-10">
                <div className="flex justify-between">
                    <TabsList className="grid w-[400px] grid-cols-2">
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="receivable">Receivable</TabsTrigger>
                    </TabsList>
                    <Link href='/sales/create'>
                        <Button>
                            <PlusIcon /> Create New Sales
                        </Button>
                    </Link>
                </div>
                <TabsContent value="completed" className="space-y-2">
                    <div className="container mx-auto py-2">
                        <DataTable
                            columns={columns}
                            data={data}
                            searchColumn="customerName"
                            searchPlaceholder="Search customer ..."
                            facetedFilters={[
                                {
                                    columnId: "paymentStatus",
                                    title: "Status",
                                    options: [
                                        { label: "Unpaid", value: "Unpaid" },
                                        { label: "Paid", value: "Paid" },
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