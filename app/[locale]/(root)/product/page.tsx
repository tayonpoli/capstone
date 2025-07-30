import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, PackageCheckIcon, PackageIcon, PackageMinusIcon, PackageXIcon } from "lucide-react"
import { InventoryDataTable, MaterialDataTable } from "./columns"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Inventory } from "@prisma/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

async function getData(): Promise<Inventory[]> {
    try {
        const products = await prisma.inventory.findMany({
            where: {
                category: 'product'
            },
            orderBy: {
                code: 'desc'
            }
        })
        return products
    } catch (error) {
        console.error('Error fetching data:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

async function getRawMaterial(): Promise<Inventory[]> {
    try {
        const rawMaterial = await prisma.inventory.findMany({
            where: {
                category: {
                    in: ['material', 'packaging']
                }
            },
            orderBy: {
                code: 'desc'
            }
        })
        return rawMaterial
    } catch (error) {
        console.error('Error fetching data:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

async function getInventoryStats() {
    try {
        const totalProducts = await prisma.inventory.count();

        const inStockProducts = await prisma.inventory.count({
            where: {
                stock: {
                    gt: 0
                },
            }
        });

        const outOfStockProducts = await prisma.inventory.count({
            where: {
                stock: 0
            }
        });

        const belowLimitProducts = await prisma.inventory.count({
            where: {
                stock: {
                    lt: prisma.inventory.fields.limit
                },
            }
        });

        return {
            totalProducts,
            outOfStockProducts,
            belowLimitProducts,
            inStockProducts
        };
    } catch (error) {
        console.error('Error fetching inventory stats:', error);
        return {
            totalProducts: 0,
            outOfStockProducts: 0,
            belowLimitProducts: 0
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

    const t = await getTranslations('inventory');
    const isStaff = session.user.role === 'Staff'
    const data = await getData();
    const materials = await getRawMaterial();
    const stats = await getInventoryStats();

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="text-3xl font-semibold pl-1">
                    {t('title')}
                </div>
                {!isStaff && (
                    <div className="flex justify-end">
                        <Link href='/product/create'>
                            <Button>
                                <PlusIcon /> {t('create')}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid md:grid-cols-2 xl:grid-cols-4 gap-4 px-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            {t('card.listed')}
                        </CardTitle>
                        <PackageIcon />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Items in inventory
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            {t('card.low')}
                        </CardTitle>
                        <PackageMinusIcon />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.belowLimitProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Items in inventory
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            {t('card.out')}
                        </CardTitle>
                        <PackageXIcon />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.outOfStockProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Items in inventory
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            {t('card.in')}
                        </CardTitle>
                        <PackageCheckIcon />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.inStockProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Items in inventory
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="product" className="py-10">
                <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="product">Product</TabsTrigger>
                    <TabsTrigger value="material">Raw Material</TabsTrigger>
                </TabsList>
                <TabsContent value="product" className="space-y-2">
                    <div className="container mx-auto py-4">
                        <InventoryDataTable data={data} />
                    </div>
                </TabsContent>
                <TabsContent value="material" className="space-y-2">
                    <div className="container mx-auto py-4">
                        <MaterialDataTable data={materials} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}