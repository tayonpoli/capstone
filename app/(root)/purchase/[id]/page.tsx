import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SalesDetail } from "@/components/sales/SalesDetail";
import { DetailPurchase } from "@/components/purchase/DetailPurchase";

export default async function PurchaseDetailPage({
    params
}: {
    params: { id: string }
}) {
    const purchase = await prisma.purchaseOrder.findUnique({
        where: { id: String(params.id) },
        include: {
            staff: true,
            supplier: true,
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    return (
        <div className="h-min-full m-3 p-5 bg-white rounded-md">
            <DetailPurchase purchase={purchase} />
        </div>
    );
}