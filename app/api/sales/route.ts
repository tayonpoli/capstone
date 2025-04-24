import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: Request,
) {
    try {

        const body = await req.json();
        const {
            customerId,
            address,
            email,
            orderDate,
            tag,
            status,
            memo,
            items
        } = body;

        if (!customerId) {
            return new NextResponse("Customer ID is required", { status: 400 });
        }

        if (!items || !items.length) {
            return new NextResponse("Items are required", { status: 400 });
        }

        // Calculate total
        const total = items.reduce((sum: number, item: any) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Create sales order with items
        const salesOrder = await prisma.salesOrder.create({
            data: {
                customerId,
                address,
                email,
                orderDate: new Date(orderDate),
                tag,
                status,
                memo,
                total,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        note: item.note,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.price * item.quantity,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        return NextResponse.json(salesOrder);
    } catch (error) {
        console.error('[SALES_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}