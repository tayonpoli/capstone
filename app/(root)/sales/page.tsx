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
import { invoiceColumns } from "./invoiceColumns"

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

async function getInvoiceData(): Promise<any[]> {
    try {
        const invoice = await prisma.salesInvoice.findMany({
            include: {
                salesOrder: {
                    select: {
                        customer: true
                    }
                },
            },
        })

        return invoice

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
        const totalTransactions = await prisma.salesOrder.count();

        const revenueResult = await prisma.salesOrder.aggregate({
            where: {
                paymentStatus: "Paid"
            },
            _sum: {
                total: true
            }
        });

        const totalRevenue = revenueResult._sum.total || 0;

        const receivableResult = await prisma.salesOrder.aggregate({
            where: {
                paymentStatus: "Unpaid"
            },
            _sum: {
                total: true
            }
        });

        const totalReceivable = receivableResult._sum.total || 0;

        return {
            customer,
            totalTransactions,
            totalRevenue,
            totalReceivable,
        };
    } catch (error) {
        console.error('Error fetching sales stats:', error);
        return {
            customer: 0,
            totalTransactions: 0,
            totalRevenue: 0,
            totalReceivable: 0,
        };
    } finally {
        await prisma.$disconnect();
    }
}

export default async function page() {
    const data = await getData();
    const invoiceData = await getInvoiceData();
    const salesStats = await getSalesStats();

    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="text-3xl font-semibold pl-1">
                    Sales
                </div>
                <div className="flex justify-end">
                    <Link href='/sales/create'>
                        <Button>
                            <PlusIcon /> Create New Sales
                        </Button>
                    </Link>
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
                            Account Receivable
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatIDR(salesStats.totalReceivable)}</div>
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
            <Tabs defaultValue="order" className="py-10">
                <div className="flex justify-between">
                    <TabsList className="grid w-[400px] grid-cols-2">
                        <TabsTrigger value="order">Sales Order</TabsTrigger>
                        <TabsTrigger value="invoice">Sales Invoice</TabsTrigger>
                    </TabsList>
                    <ReportGenerator reportType="sales" />
                </div>
                <TabsContent value="order" className="space-y-2">
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
                <TabsContent value="invoice" className="space-y-2">
                    <div className="container mx-auto py-2">
                        <DataTable
                            columns={invoiceColumns}
                            data={invoiceData}
                            searchColumn="customerName"
                            searchPlaceholder="Search customer ..."
                            facetedFilters={[
                                {
                                    columnId: "paymentMethod",
                                    title: "Method",
                                    options: [
                                        { label: "Transfer", value: "Transfer" },
                                        { label: "Cash", value: "Cash" },
                                        { label: "QRIS", value: "Qris" },
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