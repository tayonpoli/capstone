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
        const payment = await prisma.invoice.create({
            data: {
                amount: body.amount,
                paymentMethod: body.paymentMethod,
                bankName: body.bankName,
                accountNumber: body.accountNumber,
                paymentDate: new Date(body.paymentDate),
                purchaseOrderId: id,
            },
        });

        // Check if full amount is paid
        const purchase = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: { Invoice: true },
        });

        const totalPaid = purchase?.Invoice.reduce(
            (sum, invoice) => sum + invoice.amount,
            0
        );

        if (totalPaid >= purchase!.total) {
            await prisma.purchaseOrder.update({
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