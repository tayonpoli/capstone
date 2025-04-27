import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SalesDetail } from "@/components/sales/SalesDetail";

export default async function SalesDetailPage({
    params
}: {
    params: { id: string }
}) {
    const sales = await prisma.salesOrder.findUnique({
        where: { id: String(params.id) },
        include: {
            customer: true,
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    return (
        <div className="h-min-full m-3 p-5 bg-white rounded-md">
            <SalesDetail sales={sales} />
        </div>
    );
}