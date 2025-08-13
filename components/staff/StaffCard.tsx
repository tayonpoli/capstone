import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BookUser, Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

async function getContactStats() {
    try {
        const totalEmployee = await prisma.staff.count();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newEmployee = await prisma.staff.count({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo,
                }
            }
        });
        const totalBarista = await prisma.staff.count({
            where: {
                OR: [
                    { position: 'Barista' },
                    { position: 'Headbar' }
                ]
            }
        });
        const totalCashier = await prisma.staff.count({
            where: {
                position: 'Cashier'
            }
        });


        return {
            totalEmployee,
            newEmployee,
            totalBarista,
            totalCashier
        };
    } catch (error) {
        console.error('Error fetching employee stats:', error);
        return {
            totalEmployee: 0,
            newEmployee: 0,
            totalBarista: 0,
            totalCashier: 0
        };
    } finally {
        await prisma.$disconnect();
    }
}

export async function StaffCard() {
    const t = await getTranslations('staff.card');

    const stats = await getContactStats();
    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-4 gap-4 px-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">
                        {t('title1')}
                    </CardTitle>
                    <CardAction>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <Info />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-40 text-xs">
                                Current number of staff members listed
                            </HoverCardContent>
                        </HoverCard>
                    </CardAction>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold pl-1">{stats.totalEmployee}</div>
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
                    <CardAction>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <Info />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-40 text-xs">
                                Total Employees onboarded this month
                            </HoverCardContent>
                        </HoverCard>
                    </CardAction>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold pl-1">{stats.newEmployee}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('subTitle2')}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">
                        {t('title3')}
                    </CardTitle>
                    <CardAction>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <Info />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-40 text-xs">
                                Total Employees on the Barista Position
                            </HoverCardContent>
                        </HoverCard>
                    </CardAction>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold pl-1">{stats.totalBarista}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('subTitle3')}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">
                        {t('title4')}
                    </CardTitle>
                    <CardAction>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <Info />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-40 text-xs">
                                Total Employees on the Cashier Position
                            </HoverCardContent>
                        </HoverCard>
                    </CardAction>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold pl-1">{stats.totalCashier}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('subTitle4')}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}