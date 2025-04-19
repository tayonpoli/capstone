import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CirclePlusIcon, PackageCheckIcon, PackageIcon, PackageMinusIcon, PackageXIcon } from "lucide-react"
import { Product, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

async function getData(): Promise<Product[]> {
    // Fetch data from your API here.
    try {
        const products = await prisma.inventory.findMany()
        return products
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
    const data = await getData();
    const stats = await getInventoryStats();

    return (
        <div className="min-h-screen m-3 p-5 bg-white rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="text-3xl font-semibold pl-1">
                    Inventory
                </div>
                <div className="flex justify-end">
                    <Link href='/product/create'>
                        <Button>
                            <CirclePlusIcon /> Create New Product
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            Total Products
                        </CardTitle>
                        <PackageIcon />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Products in inventory
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            Low Stock
                        </CardTitle>
                        <PackageMinusIcon />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.belowLimitProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Products in inventory
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            Out of Stock
                        </CardTitle>
                        <PackageXIcon />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.outOfStockProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Products in inventory
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            In Stock
                        </CardTitle>
                        <PackageCheckIcon />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.inStockProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Products in inventory
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="completed" className="py-10">
                <TabsList className="grid w-[400px] grid-cols-2">
                    <TabsTrigger value="completed">In Stock</TabsTrigger>
                    <TabsTrigger value="receivable">Out of Stock</TabsTrigger>
                </TabsList>
                <TabsContent value="completed" className="space-y-4">
                    <div className="container mx-auto py-4">
                        <DataTable columns={columns} data={data} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}