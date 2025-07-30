import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { CustomerDataTable } from "./columns"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ContactCards } from "@/components/charts/ContactCards"
import { Customer } from "@prisma/client"

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

export default async function page() {
    const t = await getTranslations('contacts')
    const data = await getData();

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="pl-1">
                    <p className='text-sm font-light text-gray-400'>
                        {t('title')}
                    </p>
                    <h1 className='text-3xl font-semibold'>
                        {t('customer.subTitle')}
                    </h1>
                </div>
                <div className="flex justify-end">
                    <Link href='/customer/create'>
                        <Button>
                            <PlusIcon /> {t('customer.create')}
                        </Button>
                    </Link>
                </div>
            </div>
            <ContactCards />
            <div className="container mx-auto py-8">
                {/* <DataTable
                    columns={columns}
                    data={data}
                    searchColumn="name"
                    searchPlaceholder={t('customer.search')}
                /> */}
                <CustomerDataTable data={data} />
            </div>
        </div>
    )
}