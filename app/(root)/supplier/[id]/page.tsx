import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DetailCustomer } from "@/components/customer/DetailCustomer"
import { DetailSupplier } from "@/components/supplier/DetailSupplier"

export default async function SupplierDetailPage({
    params
}: {
    params: { id: string }
}) {
    const supplier = await prisma.supplier.findUnique({
        where: { id: params.id }
    })

    if (!supplier) return notFound()

    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <DetailSupplier supplier={supplier} />
        </div>
    );
}