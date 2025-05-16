import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SalesDetail } from "@/components/sales/SalesDetail";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Undo2Icon } from "lucide-react";
import { ReportButton } from "@/components/reports/ReportButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SalesPayment } from "@/components/sales/SalesPayment";

export default async function SalesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const sales = await prisma.salesOrder.findUnique({
        where: { id: id },
        include: {
            customer: true,
            items: {
                include: {
                    product: true
                }
            },
            SalesInvoice: true // Include payment data if exists
        }
    });

    if (!sales) {
        return notFound();
    }

    const isPaid = sales.paymentStatus === 'Paid';
    const totalPaid = sales.SalesInvoice?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0;
    const remainingAmount = sales.total - totalPaid;

    return (
        <div className="h-min-screen m-3 p-5 bg-white rounded-md">
            <div className="flex flex-center items-start p-4 pb-0">
                <div>
                    <p className='text-sm font-light text-gray-400'>
                        Sales
                    </p>
                    <h1 className='mb-10 text-2xl font-semibold'>
                        Sales Order Details
                    </h1>
                </div>
                <div className="flex flex-center ml-auto space-x-4">
                    <Button asChild variant='outline'>
                        <Link href={`/sales`}>
                            <Undo2Icon className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="mb-10">
                <SalesDetail sales={sales} />
            </div>

            <div className='flex justify-end mt-auto space-x-4'>
                <Button asChild variant='outline'>
                    <Link href={`/sales/${id}/edit`}>
                        Edit
                    </Link>
                </Button>
                <ReportButton order={sales} type="sales" />

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
                            <SalesPayment
                                salesId={id}
                                remainingAmount={remainingAmount}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}