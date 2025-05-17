import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PurchaseItem } from '@prisma/client';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            staffId,
            supplierId,
            contact,
            purchaseDate,
            dueDate,
            urgency,
            tag,
            status,
            memo,
            items
        } = body;

        if (!supplierId) {
            return new NextResponse("Supplier ID is required", { status: 400 });
        }

        if (!items || !items.length) {
            return new NextResponse("Items are required", { status: 400 });
        }

        // Calculate total
        const total = items.reduce((sum: number, item: PurchaseItem) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Start transaction
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Create sales order
            const purchaseOrder = await prisma.purchaseOrder.create({
                data: {
                    staffId,
                    supplierId,
                    contact,
                    purchaseDate: new Date(purchaseDate),
                    dueDate: new Date(dueDate),
                    urgency,
                    tag,
                    status,
                    memo,
                    total,
                    items: {
                        create: items.map((item: PurchaseItem) => ({
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
                            increment: item.quantity
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

            return purchaseOrder;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('[PURCHASE_POST]', error);

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
            { error: 'purchase ID is required' },
            { status: 400 }
        )
    }

    try {
        await prisma.purchaseItem.deleteMany({
            where: { purchaseOrderId: id },
        })

        await prisma.purchaseOrder.delete({
            where: { id: id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[PURCHASE_DELETE]', error);
        return NextResponse.json(
            { error: 'Failed to delete the purchase order' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}