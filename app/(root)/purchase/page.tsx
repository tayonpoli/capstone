import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, Info } from "lucide-react"
import { columns, Purchase } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportGenerator } from "@/components/reports/ReportGenerator"
import { formatIDR } from "@/lib/formatCurrency"
import { invoiceColumns, PurchaseInvoice } from "./invoicecolumns"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getData(): Promise<Purchase[]> {
    try {
        const purchase = await prisma.purchaseOrder.findMany({
            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true
                    }
                },
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

async function getInvoiceData(): Promise<PurchaseInvoice[]> {
    try {
        const invoice = await prisma.invoice.findMany({
            include: {
                purchaseOrder: {
                    include: {
                        supplier: {
                            select: {
                                name: true
                            }
                        }
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

async function getStats() {
    try {

        const supplier = await prisma.supplier.count();
        // Total jumlah transaksi sales
        const totalTransactions = await prisma.purchaseOrder.count();

        // Menghitung total revenue dari sales order yang completed
        const expenseResult = await prisma.purchaseOrder.aggregate({
            where: {
                paymentStatus: "Paid"
            },
            _sum: {
                total: true
            }
        });

        const totalExpense = expenseResult._sum.total || 0;


        const payable = await prisma.purchaseOrder.aggregate({
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

    const isStaff = session.user.role === 'Staff'

    const data = await getData();
    const invoiceData = await getInvoiceData();
    const stats = await getStats();

    return (
        <div className="min-h-screen m-3 p-5 bg-white rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="text-3xl font-semibold pl-1">
                    Purchase
                </div>
                {!isStaff && (
                    <div className="flex justify-end">
                        <Link href='/purchase/create'>
                            <Button>
                                <PlusIcon /> Create New Purchase
                            </Button>
                        </Link>
                    </div>
                )}
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
                            Account Payable
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatIDR(stats.totalPayable)}</div>
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
            </div>
            <Tabs defaultValue="order" className="py-8">
                <div className="flex justify-between">
                    <TabsList className="grid w-[400px] grid-cols-2">
                        <TabsTrigger value="order">Purchase Order</TabsTrigger>
                        <TabsTrigger value="invoice">Purchase Invoice</TabsTrigger>
                    </TabsList>
                    {!isStaff && (
                        <ReportGenerator reportType="purchasing" />
                    )}
                </div>
                <TabsContent value="order" className="space-y-2">
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
                <TabsContent value="invoice" className="space-y-2">
                    <div className="container mx-auto py-2">
                        <DataTable
                            columns={invoiceColumns}
                            data={invoiceData}
                            searchColumn="supplierName"
                            searchPlaceholder="Search supplier ..."
                            facetedFilters={[
                                {
                                    columnId: "paymentMethod",
                                    title: "Method",
                                    options: [
                                        { label: "Transfer", value: "Transfer" },
                                        { label: "Cash", value: "Cash" },
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