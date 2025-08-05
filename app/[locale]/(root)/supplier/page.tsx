import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { SupplierDataTable } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Supplier } from "@prisma/client"
import { SupplierCard } from "@/components/supplier/SupplierCard"

async function getData(): Promise<Supplier[]> {
    try {
        const suppliers = await prisma.supplier.findMany()
        return suppliers
    } catch (error) {
        console.error('Error fetching data:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

export default async function page() {
    const session = await getServerSession(authOptions);

    const allowedRoles = ['Admin', 'Owner'];

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    if (!allowedRoles.includes(session.user.role)) {
        redirect("/unauthorized")
    }

    const t = await getTranslations('contacts');

    const data = await getData();

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="pl-1">
                    <p className='text-sm font-light text-gray-400'>
                        {t('title')}
                    </p>
                    <h1 className='text-3xl font-semibold'>
                        {t('supplier.subTitle')}
                    </h1>
                </div>
                <div className="flex justify-end">
                    <Link href='/supplier/create'>
                        <Button>
                            <PlusIcon /> {t('supplier.create')}
                        </Button>
                    </Link>
                </div>
            </div>
            <SupplierCard />
            <div className="container mx-auto py-8">
                <SupplierDataTable
                    data={data}
                />
            </div>
        </div>
    )
}