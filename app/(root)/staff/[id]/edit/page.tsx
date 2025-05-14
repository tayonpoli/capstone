import StaffForm from "@/components/staff/StaffForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditStaff({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const staff = await prisma.staff.findUnique({
        where: { id: id }
    })

    if (!staff) return notFound()

    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Contacts
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Edit Staff
                </div>
            </div>
            <StaffForm initialData={staff} />
        </div>
    )
}