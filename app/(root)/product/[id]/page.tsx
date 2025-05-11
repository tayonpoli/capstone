import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductDetail } from "@/components/products/DetailProduct"

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const product = await prisma.inventory.findUnique({
        where: { id: id }
    })

    if (!product) return notFound()

    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <ProductDetail product={product} />
        </div>
    );
}