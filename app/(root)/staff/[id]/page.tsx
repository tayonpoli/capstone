import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DetailStaff } from "@/components/staff/DetailStaff"

export default async function CustomerDetailPage({
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
        <div className="h-full m-3 p-5 rounded-md">
            <DetailStaff staff={staff} />
        </div>
    );
}