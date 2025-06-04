import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request, {
        params,
    }: {
        params: Promise<{ id: string }>
    }) {
    try {
        const { id } = await params
        const body = await request.json();

        // Validasi data wajib
        if (!body.supplierId || !body.expenseDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Mulai database transaction
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Update data utama sales
            const updatedExpense = await prisma.expenses.update({
                where: { id: id },
                data: {
                    supplierId: body.supplierId,
                    expenseDate: new Date(body.expenseDate),
                    category: body.category,
                    memo: body.memo,
                    total: body.total,
                },
            });


            return { expenses: updatedExpense };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('[EXPENSES_UPDATE_ERROR]', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Create payment record
        const payment = await prisma.expenseInvoice.create({
            data: {
                amount: body.amount,
                paymentMethod: body.paymentMethod,
                bankName: body.bankName,
                accountNumber: body.accountNumber,
                paymentDate: new Date(body.paymentDate),
                expensesId: id,
            },
        });

        // Check if full amount is paid
        const expenses = await prisma.expenses.findUnique({
            where: { id },
            include: { ExpenseInvoice: true },
        });

        const totalPaid = expenses?.ExpenseInvoice.reduce(
            (sum, invoice) => sum + invoice.amount,
            0
        ) ?? 0;

        if (totalPaid >= expenses!.total) {
            await prisma.expenses.update({
                where: { id },
                data: { paymentStatus: "Paid" },
            });
        }

        return NextResponse.json(payment);
    } catch (error) {
        console.error('[PAY_POST_ERROR]', error);
        return NextResponse.json(
            { error: "Payment processing failed" },
            { status: 500 }
        );
    }
}