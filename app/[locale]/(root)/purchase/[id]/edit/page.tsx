import { notFound, redirect } from 'next/navigation'
import { Inventory, Staff, Supplier } from '@prisma/client'
import { prisma } from "@/lib/prisma";
import { EditPurchaseForm } from '@/components/purchase/EditPurchaseForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface PurchaseData {
  id: string
  staffId: string
  supplierId: string
  contact: string | null
  address?: string | null
  email?: string | null
  purchaseDate: string
  dueDate: string
  tag?: string | null
  status: string
  urgency: string
  memo?: string | null
  items: {
    productId: string
    note?: string | null
    quantity: number
    price: number
  }[]
}

export default async function EditPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions);

  const allowedRoles = ['Admin', 'Owner'];

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized")
  }


  const { id } = await params
  // Fetch data secara paralel di server component
  const [purchaseData, suppliers, staffs, products] = await Promise.all([
    getPurchaseData(id),
    getSupplier(),
    getStaff(),
    getProducts()
  ])

  if (!purchaseData) {
    redirect(`/purchase/${id}`);
  }

  async function getPurchaseData(id: string): Promise<PurchaseData | null> {
    try {
      const purchase = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: { items: true },
      })

      if (!purchase) return null

      if (purchase.paymentStatus === "Paid") return null

      return {
        id: purchase.id,
        staffId: purchase.staffId,
        supplierId: purchase.supplierId,
        contact: purchase.contact,
        purchaseDate: purchase.purchaseDate.toISOString(),
        dueDate: purchase.dueDate.toISOString(),
        tag: purchase.tag || undefined,
        status: purchase.status,
        urgency: purchase.urgency,
        memo: purchase.memo || undefined,
        items: purchase.items.map(item => ({
          productId: item.productId,
          note: item.note || undefined,
          quantity: item.quantity,
          price: item.price,
        })),
      }
    } catch (error) {
      console.error('Failed to fetch purchase:', error)
      return null
    }
  }

  async function getSupplier(): Promise<Supplier[]> {
    try {
      return await prisma.supplier.findMany({
        include: {
          contacts: true
        },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
      return []
    }
  }

  async function getStaff(): Promise<Staff[]> {
    try {
      return await prisma.staff.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      console.error('Failed to fetch staff:', error)
      return []
    }
  }

  async function getProducts(): Promise<Inventory[]> {
    try {
      return await prisma.inventory.findMany({
        where: {
          OR: [
            { category: 'material' },
            { category: 'packaging' },
          ]
        },
        orderBy: { product: 'asc' },
      })
    } catch (error) {
      console.error('Failed to fetch products:', error)
      return []
    }
  }

  return (
    <div className="h-min-full m-3 p-5 rounded-md">
      <div className="px-3">
        <div className='text-sm font-light text-gray-400'>
          Purchase
        </div>
        <div className='mb-6 text-3xl font-semibold'>
          Edit Purchase Order
        </div>
      </div>
      <EditPurchaseForm
        initialData={purchaseData}
        suppliers={suppliers}
        staffs={staffs}
        products={products}
      />
    </div>
  )
}
