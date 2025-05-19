import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, BookUser } from "lucide-react"
import { Customer, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

async function getData(): Promise<Customer[]> {
    try {
        const customers = await prisma.customer.findMany()
        return customers
    } catch (error) {
        console.error('Error fetching data:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

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

export default async function page() {
    const data = await getData();
    const stats = await getContactStats();

    return (
        <div className="min-h-screen m-3 p-5 rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="pl-1">
                    <p className='text-sm font-light text-gray-400'>
                        Contacts
                    </p>
                    <h1 className='text-3xl font-semibold'>
                        Customers
                    </h1>
                </div>
                <div className="flex justify-end">
                    <Link href='/customer/create'>
                        <Button>
                            <PlusIcon /> Create New Customer
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            Customers
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
                            Suppliers
                        </CardTitle>
                        <BookUser />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.totalSupplier}</div>
                        <p className="text-xs text-muted-foreground">
                            Supplier contact listed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            Staff
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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-sm font-medium">
                            Staff
                        </CardTitle>
                        <BookUser />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold pl-1">{stats.totalStaff}</div>
                        <p className="text-xs text-muted-foreground">
                            Customers contact listed
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="container mx-auto py-8">
                <DataTable
                    columns={columns}
                    data={data}
                    searchColumn="name"
                    searchPlaceholder="Search customer ..."
                />
            </div>
        </div>
    )
}