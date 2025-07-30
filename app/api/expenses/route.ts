import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            supplierId,
            expenseDate,
            category,
            paymentStatus,
            memo,
            total
        } = body;

        if (!supplierId) {
            return new NextResponse("Vendor ID is required", { status: 400 });
        }

        // Start transaction
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Create sales order
            const Expenses = await prisma.expenses.create({
                data: {
                    supplierId,
                    expenseDate: new Date(expenseDate),
                    category,
                    paymentStatus,
                    memo,
                    total,
                },
            });

            return Expenses;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('[EXPENSES_POST]', error);

        return new NextResponse("Internal error", { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);

    const allowedRoles = ['Admin', 'Owner'];

    // Jika tidak ada session, redirect ke login
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    if (!allowedRoles.includes(session.user.role)) {
        return NextResponse.json(
            { error: 'You are unauthorized' },
            { status: 401 }
        );
    }
    const { id } = await request.json()

    if (!id) {
        return NextResponse.json(
            { error: 'expense ID is required' },
            { status: 400 }
        )
    }

    try {
        await prisma.expenseInvoice.deleteMany({
            where: { expensesId: id }
        })

        await prisma.expenses.delete({
            where: { id: id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[EXPENSES_DELETE]', error);
        return NextResponse.json(
            { error: 'Failed to delete the expenses' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}