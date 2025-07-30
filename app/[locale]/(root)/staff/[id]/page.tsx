import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DetailStaff } from "@/components/staff/DetailStaff"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TransactionList } from "@/components/staff/TransactionList";
import { describe } from "node:test";

export default async function CustomerDetailPage({
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
    const staff = await prisma.staff.findUnique({
        where: { id: id }
    })

    const sales = await prisma.salesOrder.findMany({
        include: {
            customer: true,
            user: {
                select: {
                    email: true
                }
            }
        }, orderBy: {
            orderDate: 'desc'
        }
    })


    if (!staff) return notFound()

    return (
        <div className="h-full m-3 p-5 rounded-md">
            <DetailStaff staff={staff} />
            <TransactionList
                sales={sales}
                staff={staff}
            />
        </div>
    );
}