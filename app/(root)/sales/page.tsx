import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, PackageCheckIcon, PackageIcon, PackageMinusIcon, PackageXIcon } from "lucide-react"
import { Sales, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

async function getData(): Promise<any[]> {
    try {
      const sales = await prisma.salesOrder.findMany({
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

// async function getInventoryStats() {
//     try {
//         const totalProducts = await prisma.inventory.count();

//         const inStockProducts = await prisma.inventory.count({
//             where: {
//                 stock: {
//                     gt: 0
//                 },
//             }
//         });

//         const outOfStockProducts = await prisma.inventory.count({
//             where: {
//                 stock: 0
//             }
//         });

//         const belowLimitProducts = await prisma.inventory.count({
//             where: {
//                 stock: {
//                     lt: prisma.inventory.fields.limit
//                 },
//             }
//         });

//         return {
//             totalProducts,
//             outOfStockProducts,
//             belowLimitProducts,
//             inStockProducts
//         };
//     } catch (error) {
//         console.error('Error fetching inventory stats:', error);
//         return {
//             totalProducts: 0,
//             outOfStockProducts: 0,
//             belowLimitProducts: 0
//         };
//     } finally {
//         await prisma.$disconnect();
//     }
// }

export default async function page() {
    const data = await getData();
    // const stats = await getInventoryStats();

    return (
        <div className="min-h-screen m-3 p-5 bg-white rounded-md">
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="completed" className="py-10">
                <TabsList className="grid w-[400px] grid-cols-2">
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="receivable">Receivable</TabsTrigger>
                </TabsList>
                <TabsContent value="completed" className="space-y-4">
                    <div className="container mx-auto py-8">
                        <DataTable
                            columns={columns}
                            data={data}
                            searchColumn="customerName"
                            searchPlaceholder="Search customer ..."
                            facetedFilters={[
                                {
                                    columnId: "status",
                                    title: "Status",
                                    options: [
                                        { label: "Completed", value: "Completed" },
                                        { label: "Pending", value: "Pending" },
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