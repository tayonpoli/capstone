import SalesForm from "@/components/form/SalesForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditSales({ params }: { params: { id: string } }) {
    const sales = await prisma.salesOrder.findUnique({
        where: { id: String(params.id) }
    });

    if (!sales) return notFound()

    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Sales
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Edit Sales Order
                </div>
            </div>
            <SalesForm initialData={sales} />
        </div>
    )
}