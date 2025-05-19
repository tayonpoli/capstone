import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DetailSupplier } from "@/components/supplier/DetailSupplier"

export default async function SupplierDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supplier = await prisma.supplier.findUnique({
        where: { id: id }
    })

    if (!supplier) return notFound()

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <DetailSupplier supplier={supplier} />
        </div>
    );
}