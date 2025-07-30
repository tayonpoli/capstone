import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { StaffDataTable } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ContactCards } from "@/components/charts/ContactCards"
import { Staff } from "@prisma/client"

async function getData(): Promise<Staff[]> {
    try {
        const staff = await prisma.staff.findMany()
        return staff
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

    const t = await getTranslations('staff')

    const data = await getData();

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="grid grid-cols-2 mb-8">
                <div className="pl-1">
                    <p className='text-sm font-light text-gray-400'>
                        {t('title')}
                    </p>
                    <h1 className='text-3xl font-semibold'>
                        {t('subTitle')}
                    </h1>
                </div>
                <div className="flex justify-end">
                    <Link href='/staff/create'>
                        <Button>
                            <PlusIcon /> {t('create')}
                        </Button>
                    </Link>
                </div>
            </div>
            <ContactCards />
            <div className="container mx-auto py-8">
                <StaffDataTable data={data} />
            </div>
        </div>
    )
}