import ProductForm from "@/components/form/ProductForm"
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation"

export default async function EditProduct({
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
    const product = await prisma.inventory.findUnique({
        where: { id: id }
    })

    if (!product) return notFound()

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Inventory
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Edit Product
                </div>
            </div>
            <ProductForm initialData={product} />
        </div>
    )
}