import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductionDetail } from "@/components/production/ProductionDetail";

export default async function ProductionDetailPage({
    params
}: {
    params: { id: string }
}) {
    const production = await prisma.production.findUnique({
        where: { id: String(params.id) },
        include: {
            product: true,
            materials: {
                include: {
                    material: true
                }
            }
        }
    });

    return (
        <div className="h-min-full m-3 p-5 bg-white rounded-md">
            <ProductionDetail production={production} />
        </div>
    );
}