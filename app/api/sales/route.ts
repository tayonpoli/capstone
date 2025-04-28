import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
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

        // Start transaction
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Create sales order
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

            // 2. Update stock for each product
            for (const item of items) {
                await prisma.inventory.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                });

                // Optional: Check for negative stock (if you want to prevent it)
                const updatedProduct = await prisma.inventory.findUnique({
                    where: { id: item.productId }
                });

                if (updatedProduct && updatedProduct.stock < 0) {
                    throw new Error(`Insufficient stock for product ${item.productId}`);
                }
            }

            return salesOrder;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('[SALES_POST]', error);
        
        if (error instanceof Error && error.message.includes('Insufficient stock')) {
            return new NextResponse(error.message, { status: 400 });
        }
        
        return new NextResponse("Internal error", { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(request: Request) {
    const { id } = await request.json()

    if (!id) {
        return NextResponse.json(
            { error: 'Sales ID is required' },
            { status: 400 }
        )
    }

    try {
        await prisma.salesItem.deleteMany({
            where: { salesOrderId: id },
          })

        await prisma.salesOrder.delete({
            where: { id: id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete the sales order' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}