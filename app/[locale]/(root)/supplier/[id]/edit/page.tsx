import SupplierForm from "@/components/supplier/SupplierForm"
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation"

export default async function EditSupplier({
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
    const supplier = await prisma.supplier.findUnique({
        where: { id: id },
        include: {
            contacts: true
        }
    })

    if (!supplier) return notFound()

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Suppliers
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Edit Supplier
                </div>
            </div>
            <SupplierForm initialData={supplier} />
        </div>
    )
}