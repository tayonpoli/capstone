import SupplierForm from "@/components/supplier/SupplierForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditSupplier({ params }: { params: { id: string } }) {
    const supplier = await prisma.supplier.findUnique({
        where: { id: params.id }
    })

    if (!supplier) return notFound()

    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Suppliers
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Edit Supplier
                </div>
            </div>
            <SupplierForm initialData={supplier} />
        </div>
    )
}