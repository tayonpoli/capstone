import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DetailCustomer } from "@/components/customer/DetailCustomer"

export default async function CustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const customer = await prisma.customer.findUnique({
        where: { id: id }
    })

    if (!customer) return notFound()

    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <DetailCustomer customer={customer} />
        </div>
    );
}