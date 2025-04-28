import { CreateSalesForm } from "@/components/sales/SalesForm";
import { prisma } from "@/lib/prisma";

export default async function CreateSalesPage() {
    // Fetch customers data
    const customers = await prisma.customer.findMany({
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
                    Sales
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    New Sales Order
                </div>
            </div>
            <CreateSalesForm
                customers={customers}
                products={products}
            />
        </div>
    );
}