import { ProductionForm } from "@/components/production/ProductionForm";
import { prisma } from "@/lib/prisma";

export default async function CreateBomPage() {
    // Fetch finished products data
    const finishedProducts = await prisma.inventory.findMany({
        orderBy: {
            product: 'asc',
        },
    });

    // Fetch raw materials data
    const rawMaterials = await prisma.inventory.findMany({
        orderBy: {
            product: 'asc',
        },
    });

    return (
        <div className="h-min-full m-3 p-5 bg-white rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Production
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Create New Bill of Materials (BOM)
                </div>
            </div>
            <ProductionForm
                finishedProducts={finishedProducts}
                rawMaterials={rawMaterials}
            />
        </div>
    );
}