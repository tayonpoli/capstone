import CustomerForm from "@/components/customer/CustomerForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditCustomer({
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
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Customers
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Edit Customer
                </div>
            </div>
            <CustomerForm initialData={customer} />
        </div>
    )
}