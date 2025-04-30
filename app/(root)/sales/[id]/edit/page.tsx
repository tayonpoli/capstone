import { notFound, redirect } from 'next/navigation'
import { Customer, Inventory } from '@prisma/client'
import { EditSalesForm } from '@/components/sales/EditSalesForm'
import { prisma } from "@/lib/prisma";

interface SalesData {
  id: string
  customerId: string
  address?: string | null
  email?: string | null
  orderDate: string
  tag?: string | null
  status: string
  memo?: string | null
  items: {
    productId: string
    note?: string | null
    quantity: number
    price: number
  }[]
}

export default async function EditSalesPage({
  params
}: {
  params: { id: string }
}) {
  // Fetch data secara paralel di server component
  const [saleData, customers, products] = await Promise.all([
    getSaleData(params.id),
    getCustomers(),
    getProducts()
  ])

  if (!saleData) {
    notFound()
  }

  async function getSaleData(id: string): Promise<SalesData | null> {
    try {
      const sale = await prisma.salesOrder.findUnique({
        where: { id },
        include: { items: true },
      })
  
      if (!sale) return null
  
      return {
        id: sale.id,
        customerId: sale.customerId,
        address: sale.address || undefined,
        email: sale.email || undefined,
        orderDate: sale.orderDate.toISOString(),
        tag: sale.tag || undefined,
        status: sale.status,
        memo: sale.memo || undefined,
        items: sale.items.map(item => ({
          productId: item.productId,
          note: item.note || undefined,
          quantity: item.quantity,
          price: item.price,
        })),
      }
    } catch (error) {
      console.error('Failed to fetch sale:', error)
      return null
    }
  }
  
  async function getCustomers(): Promise<Customer[]> {
    try {
      return await prisma.customer.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      return []
    }
  }
  
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
                    Sales
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                   Edit Sales Order
                </div>
            </div>
      <EditSalesForm 
        initialData={saleData} 
        customers={customers} 
        products={products}
        // onUpdate={updateSale}
      />
    </div>
  )
}
