import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DetailPurchase } from "@/components/purchase/DetailPurchase";
import { ReportButton } from "@/components/reports/ReportButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Undo2Icon } from "lucide-react";
import { PaymentPurchase } from "@/components/purchase/PaymentForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PurchaseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const isStaff = session.user.role === 'Staff'

    const { id } = await params
    const purchase = await prisma.purchaseOrder.findUnique({
        where: { id: id },
        include: {
            staff: true,
            supplier: true,
            items: {
                include: {
                    product: true
                }
            },
            Invoice: true // Include payment data if exists
        }
    });

    if (!purchase) {
        return notFound();
    }

    const isPaid = purchase.paymentStatus === 'Paid';
    const totalPaid = purchase.Invoice?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0;
    const remainingAmount = purchase.total - totalPaid;

    return (
        <div className="h-min-screen m-3 p-5 rounded-md">
            <div className="flex flex-center items-start px-4">
                <div>
                    <p className='text-sm font-light text-gray-400'>
                        Purchase
                    </p>
                    <h1 className='mb-6 text-2xl font-semibold'>
                        Purchase Order Details
                    </h1>
                </div>
                <div className="flex flex-center ml-auto space-x-4">
                    <Button asChild variant='outline'>
                        <Link href={`/purchase`}>
                            <Undo2Icon className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="mb-10">
                <DetailPurchase purchase={purchase} />
            </div>

            <div className='flex justify-end mt-auto space-x-4'>
                {!isStaff && (
                    <>
                        <ReportButton order={purchase} type="purchase" />
                        <Button variant='outline' asChild>
                            <Link href={`/purchase/${id}/edit`}>
                                Edit
                            </Link>
                        </Button>

                        {!isPaid && (
                            <PaymentPurchase
                                purchaseId={id}
                                remainingAmount={remainingAmount}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}