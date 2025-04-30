import { CreatePurchaseForm } from "@/components/purchase/CreatePurchaseForm";
import { prisma } from "@/lib/prisma";

export default async function CreatePurchasePage() {
    const suppliers = await prisma.supplier.findMany({
        orderBy: {
            name: 'asc',
        },
    });

    const staffs = await prisma.staff.findMany({
        orderBy: {
            name: 'asc',
        },
    });

    // Fetch products data
    const products = await prisma.inventory.findMany({
        orderBy: {
            product: 'asc',
        },
    });

    return (
        <div className="h-min-full m-3 p-5 bg-white rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Purchase
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    New Purchase Order
                </div>
            </div>
            <CreatePurchaseForm
            staffs={staffs}
                suppliers={suppliers}
                products={products}
            />
        </div>
    );
}