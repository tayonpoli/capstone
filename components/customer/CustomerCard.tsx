import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BookUser } from "lucide-react";
import { formatIDR } from "@/lib/formatCurrency";

async function getContactStats() {
    try {
        const totalCustomer = await prisma.customer.count();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newCustomer = await prisma.customer.count({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo,
                }
            }
        });
        const revenueResult = await prisma.salesOrder.aggregate({
            where: {
                paymentStatus: "Paid"
            },
            _sum: {
                total: true
            }
        });

        const totalSales = revenueResult._sum.total || 0;

        const receivable = await prisma.salesOrder.aggregate({
            where: {
                paymentStatus: "Unpaid"
            },
            _sum: {
                total: true
            }
        });

        const totalReceivable = receivable._sum.total || 0;


        return {
            totalCustomer,
            newCustomer,
            totalSales,
            totalReceivable
        };
    } catch (error) {
        console.error('Error fetching contact stats:', error);
        return {
            totalCustomer: 0,
            newCustomer: 0,
            totalSales: 0,
            totalReceivable: 0
        };
    } finally {
        await prisma.$disconnect();
    }
}

export async function CustomerCard() {
    const t = await getTranslations('contacts.customer');

    const stats = await getContactStats();
    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-4 gap-4 px-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">
                        {t('title1')}
                    </CardTitle>
                    <BookUser />
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold pl-1">{stats.totalCustomer}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('subTitle1')}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">
                        {t('title2')}
                    </CardTitle>
                    <BookUser />
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold pl-1">{stats.newCustomer}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('subTitle2')}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">
                        {t('title4')}
                    </CardTitle>
                    <BookUser />
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold pl-1">{formatIDR(stats.totalReceivable)}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('subTitle4')}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">
                        {t('title3')}
                    </CardTitle>
                    <BookUser />
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold pl-1">{formatIDR(stats.totalSales)}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('subTitle3')}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}