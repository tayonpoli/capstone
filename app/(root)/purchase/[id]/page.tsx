import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SalesDetail } from "@/components/sales/SalesDetail";
import { DetailPurchase } from "@/components/purchase/DetailPurchase";
import { ReportButton } from "@/components/reports/ReportButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Undo2Icon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PaymentForm } from "@/components/purchase/PaymentForm";

export default async function PurchaseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
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
        <div className="h-min-screen m-3 p-5 bg-white rounded-md">
            <div className="flex flex-center items-start p-4 pb-0">
                <div>
                    <p className='text-sm font-light text-gray-400'>
                        Purchase
                    </p>
                    <h1 className='mb-10 text-2xl font-semibold'>
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
                <Button asChild>
                    <Link href={`/purchase/${id}/edit`}>
                        Edit
                    </Link>
                </Button>

                {!isPaid && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                Set Payment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Payment Details</DialogTitle>
                            </DialogHeader>
                            <PaymentForm
                                purchaseId={id}
                                remainingAmount={remainingAmount}
                            />
                        </DialogContent>
                    </Dialog>
                )}

                <ReportButton order={purchase} type="purchase" />
            </div>
        </div>
    );
}