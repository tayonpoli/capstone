import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductDetail } from "@/components/products/DetailProduct"

export default async function ProductDetailPage({
    params
}: {
    params: { id: string }
}) {
    const product = await prisma.inventory.findUnique({
        where: { id: Number(params.id) }
    })

    if (!product) return notFound()

    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <ProductDetail product={product} />
        </div>
    );
}