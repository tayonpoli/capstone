import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DetailSupplier } from "@/components/supplier/DetailSupplier"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function SupplierDetailPage({
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
            <DetailSupplier supplier={supplier} />
        </div>
    );
}