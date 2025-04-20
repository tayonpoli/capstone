import ProductForm from "@/components/form/ProductForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditProduct({ params }: { params: { id: string } }) {
    const product = await prisma.inventory.findUnique({
        where: { id: Number(params.id) }
    })

    if (!product) return notFound()

    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Inventory
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Edit Product
                </div>
            </div>
            <ProductForm initialData={product} />
        </div>
    )
}