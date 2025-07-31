import { ProductionForm } from "@/components/production/ProductionForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CreateBomPage() {
    const session = await getServerSession(authOptions);

    const allowedRoles = ['Admin', 'Owner'];

    // Jika tidak ada session, redirect ke login
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    if (!allowedRoles.includes(session.user.role)) {
        redirect("/unauthorized")
    }

    // Fetch finished products data
    const finishedProducts = await prisma.inventory.findMany({
        where: {
            category: 'product'
        },
        orderBy: {
            product: 'asc',
        },
    });

    // Fetch raw materials data
    const rawMaterials = await prisma.inventory.findMany({
        where: {
            OR: [
                { category: 'material' },
                { category: 'packaging' }
            ]
        },
        orderBy: {
            product: 'asc',
        },
    });

    return (
        <div className="h-min-full m-3 p-5 rounded-md">
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