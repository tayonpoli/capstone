import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BookUser } from "lucide-react";

async function getContactStats() {
    try {
        const totalCustomer = await prisma.customer.count();
        const totalSupplier = await prisma.supplier.count();
        const totalStaff = await prisma.staff.count();


        return {
            totalCustomer,
            totalSupplier,
            totalStaff,
        };
    } catch (error) {
        console.error('Error fetching contact stats:', error);
        return {
            totalCustomer: 0,
            totalSupplier: 0,
            totalStaff: 0,
        };
    } finally {
        await prisma.$disconnect();
    }
}

export async function ContactCards() {
    const t = await getTranslations('contacts');

    const stats = await getContactStats();
    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-3 gap-4 px-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">
                        {t('card.customer')}
                    </CardTitle>
                    <BookUser />
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold pl-1">{stats.totalCustomer}</div>
                    <p className="text-xs text-muted-foreground">
                        Customer contact listed
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">
                        {t('card.supplier')}
                    </CardTitle>
                    <BookUser />
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold pl-1">{stats.totalSupplier}</div>
                    <p className="text-xs text-muted-foreground">
                        Vendor contact listed
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-sm font-medium">
                        {t('card.staff')}
                    </CardTitle>
                    <BookUser />
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold pl-1">{stats.totalStaff}</div>
                    <p className="text-xs text-muted-foreground">
                        Staff contact listed
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}