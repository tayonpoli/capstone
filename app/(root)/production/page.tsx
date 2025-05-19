import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, Boxes, PackageOpen } from "lucide-react"
import { Production, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

async function getData(): Promise<Production[]> {
    try {
        const production = await prisma.production.findMany({
            include: {
                product: {
                    select: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return production
    } catch (error) {
        console.error('Error fetching data:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

async function getProductionStats() {
    try {
        const totalBom = await prisma.production.count();

        const totalProducts = await prisma.inventory.count({
            where: {
                category: 'product'
            }
        });

        const totalMaterials = await prisma.inventory.count({
            where: {
                category: 'material'
            }
        });

        return {
            totalProducts,
            totalBom,
            totalMaterials,
        };
    } catch (error) {
        console.error('Error fetching production stats:', error);
        return {
            totalProducts: 0,
            totalBom: 0,
            totalMaterials: 0,
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
    const stats = await getProductionStats();

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="text-3xl font-semibold pl-1">
                    Production
                </div>
                {!isStaff && (
                    <div className="flex justify-end">
                        <Link href='/production/create'>
                            <Button>
                                <PlusIcon /> Create New BOM
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            Bills of Material
                        </CardTitle>
                        <Boxes />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.totalBom}</div>
                        <p className="text-xs text-muted-foreground">
                            Created in production
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            Products
                        </CardTitle>
                        <PackageOpen />
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
                            Raw Materials
                        </CardTitle>
                        <PackageOpen />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.totalMaterials}</div>
                        <p className="text-xs text-muted-foreground">
                            Items in inventory
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            In Stock
                        </CardTitle>
                        <PackageOpen />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.totalMaterials}</div>
                        <p className="text-xs text-muted-foreground">
                            Items in inventory
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="container mx-auto py-8">
                <DataTable
                    columns={columns}
                    data={data}
                    searchColumn="name"
                    searchPlaceholder="Search BOM ..."
                    facetedFilters={[
                        {
                            columnId: "tag",
                            title: "Tag",
                            options: [
                                { label: "Milk", value: "Milk" },
                                { label: "Coffee", value: "Coffee" },
                            ],
                        },
                    ]}
                />
            </div>
        </div>
    )
}