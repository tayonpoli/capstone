import { notFound, redirect } from 'next/navigation'
import { Customer, Inventory, Material, Unit } from '@prisma/client'
import { EditSalesForm } from '@/components/sales/EditSalesForm'
import { prisma } from "@/lib/prisma";
import { EditBomForm } from '@/components/production/EditProduction';

interface ProductionData {
    id: string
    name: string
    description: string | null
    productId: string
    materials: {
        materialId: string
        qty: number
        unit: Unit
    }[]
}

export default async function EditProductionPage({
    params
}: {
    params: { id: string }
}) {
    // Fetch data secara paralel di server component
    const [productionData, products] = await Promise.all([
        getProductionData(params.id),
        // getCustomers(),
        getProducts()
    ])

    if (!productionData) {
        notFound()
    }

    async function getProductionData(id: string): Promise<ProductionData | null> {
        try {
            const bom = await prisma.production.findUnique({
                where: { id },
                include: { materials: true },
            })

            if (!bom) return null

            return {
                id: bom.id,
                name: bom.name,
                description: bom.description,
                productId: bom.productId,
                materials: bom.materials.map(item => ({
                    materialId: item.materialId,
                    qty: item.qty,
                    unit: item.unit,
                })),
            }
        } catch (error) {
            console.error('Failed to fetch BOM:', error)
            return null
        }
    }

    //   async function getMaterials(): Promise<Material[]> {
    //     try {
    //       return await prisma.material.findMany({
    //         orderBy: { name: 'asc' },
    //       })
    //     } catch (error) {
    //       console.error('Failed to fetch customers:', error)
    //       return []
    //     }
    //   }

    async function getProducts(): Promise<Inventory[]> {
        try {
            return await prisma.inventory.findMany({
                where: { stock: { gt: 0 } },
                orderBy: { product: 'asc' },
            })
        } catch (error) {
            console.error('Failed to fetch products:', error)
            return []
        }
    }

    // async function updateSale(data: any) {

    //   try {
    //     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales`, {
    //       method: 'PUT',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         id: params.id,
    //         ...data
    //       }),
    //     })

    //     if (!res.ok) {
    //       throw new Error('Failed to update sale')
    //     }

    //     redirect('/sales')
    //   } catch (error) {
    //     console.error('Failed to update sale:', error)
    //     throw new Error('Failed to update sale. Please try again.')
    //   }
    // }

    return (
        <div className="h-min-full m-3 p-5 bg-white rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Production
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Edit Bills of Material
                </div>
            </div>
            <EditBomForm
                initialData={productionData}
                finishedProducts={products}
                rawMaterials={products}
            // onUpdate={updateSale}
            />
        </div>
    )
}
