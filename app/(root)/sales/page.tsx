import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, Info } from "lucide-react"
import { columns, Sales } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatIDR } from "@/lib/formatCurrency"
import { ReportGenerator } from "@/components/reports/ReportGenerator"
import { POS, posColumns } from "./posColumns"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getData(): Promise<Sales[]> {
    try {
        const sales = await prisma.salesOrder.findMany({
            where: {
                customerName: null
            },
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

async function getPosData(): Promise<POS[]> {
    try {
        const pos = await prisma.salesOrder.findMany({
            where: {
                customerName: {
                    not: null
                }
            },
            include: {
                user: {
                    select: {
                        name: true
                    }
                },
                SalesInvoice: {
                    select: {
                        paymentMethod: true
                    }
                }
            },
            orderBy: {
                orderDate: 'desc'
            }
        })

        return pos

    } catch (error) {
        console.error('Error fetching data:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

export async function getSalesStats() {
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
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const isStaff = session.user.role === 'Staff'

    const data = await getData();
    const posData = await getPosData();
    const salesStats = await getSalesStats();


    return (
        <div className="h-full m-3 p-5 rounded-md">
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 my-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatIDR(salesStats.totalRevenue)}</div>
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
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="pos" className="py-10">
                <div className="flex justify-between">
                    <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="pos">Point of Sales</TabsTrigger>
                        <TabsTrigger value="order">Sales Order</TabsTrigger>
                    </TabsList>
                    {!isStaff && (
                        <ReportGenerator reportType="sales" />
                    )}
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
                                    columnId: "tag",
                                    title: "Type",
                                    options: [
                                        { label: "Other", value: "other" },
                                        { label: "Shopee", value: "Shopee" },
                                        { label: "Grab", value: "Grab" },
                                        { label: "Gofood", value: "Gofood" },
                                        { label: "Takeaway", value: "Takeaway" },
                                    ],
                                },
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
                <TabsContent value="pos" className="space-y-2">
                    <div className="container mx-auto py-2">
                        <DataTable
                            columns={posColumns}
                            data={posData}
                            searchColumn="customerName"
                            searchPlaceholder="Search customer ..."
                            facetedFilters={[
                                {
                                    columnId: "tag",
                                    title: "Type",
                                    options: [
                                        { label: "Other", value: "other" },
                                        { label: "Shopee", value: "Shopee" },
                                        { label: "Grab", value: "Grab" },
                                        { label: "Gofood", value: "Gofood" },
                                        { label: "Takeaway", value: "Takeaway" },
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