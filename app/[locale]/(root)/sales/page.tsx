import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, Info } from "lucide-react"
import { SalesDataTable } from "./columns"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatIDR } from "@/lib/formatCurrency"
import { ReportGenerator } from "@/components/reports/ReportGenerator"
import { POSDataTable } from "./posColumns"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { POS, Sales } from "@/types/sales"

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
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const t = await getTranslations('sales');
    const isStaff = session.user.role === 'Staff'
    const data = await getData();
    const posData = await getPosData();
    const salesStats = await getSalesStats();

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="text-3xl font-semibold pl-1">
                    {t('title')}
                </div>
                <div className="flex justify-end">
                    <Link href='/sales/create'>
                        <Button>
                            <PlusIcon /> {t('create')}
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid md:grid-cols-2 xl:grid-cols-4 gap-4 px-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('card.revenue')}
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="md:text-xl xl:text-2xl font-bold">{formatIDR(salesStats.totalRevenue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('card.receivable')}
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="md:text-xl xl:text-2xl font-bold">{formatIDR(salesStats.totalReceivable)}</div>
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
                        <div className="md:text-xl xl:text-2xl font-bold">{salesStats.totalTransactions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('card.customer')}
                        </CardTitle>
                        <Info />
                    </CardHeader>
                    <CardContent>
                        <div className="md:text-xl xl:text-2xl font-bold">{salesStats.customer}</div>
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="pos" className="py-10">
                <div className="px-3 flex justify-between">
                    <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="pos">{t('tabs.pos')}</TabsTrigger>
                        <TabsTrigger value="order">{t('tabs.sales')}</TabsTrigger>
                    </TabsList>
                    {!isStaff && (
                        <ReportGenerator reportType="sales" />
                    )}
                </div>
                <TabsContent value="order" className="space-y-2">
                    <div className="container mx-auto py-2">
                        <SalesDataTable
                            data={data}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="pos" className="space-y-2">
                    <div className="container mx-auto py-2">
                        <POSDataTable
                            data={posData}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}