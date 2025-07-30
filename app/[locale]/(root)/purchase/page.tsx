import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, Info } from "lucide-react"
import { PurchaseDataTable } from "./columns"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ReportGenerator } from "@/components/reports/ReportGenerator"
import { formatIDR } from "@/lib/formatCurrency"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Purchase } from "@/types/purchase"

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

async function getPurchaseStats() {
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

    const t = await getTranslations('purchase');
    const isStaff = session.user.role === 'Staff'
    const data = await getData();
    const stats = await getPurchaseStats();

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="text-3xl font-semibold pl-1">
                    {t('title')}
                </div>
                {!isStaff && (
                    <div className="flex justify-end">
                        <Link href='/purchase/create'>
                            <Button>
                                <PlusIcon /> {t('create')}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid md:grid-cols-2 xl:grid-cols-4 gap-4 px-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('card.purchases')}
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
                            {t('card.supplier')}
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.supplier}</div>
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="order" className="py-8">
                <div className="flex justify-end">
                    {!isStaff && (
                        <ReportGenerator reportType="purchasing" />
                    )}
                </div>
                <TabsContent value="order" className="space-y-2">
                    <div className="container mx-auto py-2">
                        <PurchaseDataTable
                            data={data}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}