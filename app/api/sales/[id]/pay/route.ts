import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        // Create payment record
        const payment = await prisma.salesInvoice.create({
            data: {
                amount: body.amount,
                paymentMethod: body.paymentMethod,
                bankName: body.bankName,
                accountNumber: body.accountNumber,
                paymentDate: new Date(body.paymentDate),
                salesOrderId: id,
            },
        });

        // Check if full amount is paid
        const sales = await prisma.salesOrder.findUnique({
            where: { id },
            include: { SalesInvoice: true },
        });

        const totalPaid = sales?.SalesInvoice.reduce(
            (sum, invoice) => sum + invoice.amount,
            0
        );

        if (totalPaid >= sales!.total) {
            await prisma.salesOrder.update({
                where: { id },
                data: { paymentStatus: "Paid" },
            });
        }

        return NextResponse.json(payment);
    } catch (error) {
        return NextResponse.json(
            { error: "Payment processing failed" },
            { status: 500 }
        );
    }
}