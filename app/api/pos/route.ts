import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { convertUnit } from '@/lib/units';
import { SalesItem, Unit } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, customerId, customerName, items, total, paymentMethod, tag, memo, ...salesData } = body;

        // Validasi input
        if (!userId || !items?.length) return new NextResponse("Staff ID required", { status: 400 });
        if (!customerId) return new NextResponse("Customer ID required", { status: 400 });
        if (!items?.length) return new NextResponse("Items required", { status: 400 });

        const result = await prisma.$transaction(async (prisma) => {
            const salesOrder = await prisma.salesOrder.create({
                data: {
                    ...salesData,
                    userId,
                    customerId,
                    customerName,
                    orderDate: new Date(),
                    status: 'Completed',
                    paymentStatus: 'Paid',
                    tag: tag,
                    memo,
                    total,
                    items: {
                        create: items.map((item: SalesItem) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            total: item.price * item.quantity,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        }
                    },
                    customer: true,
                    user: true
                },
            });

            const notificationsToCreate = [];

            for (const item of items) {
                const product = await prisma.inventory.findUniqueOrThrow({
                    where: { id: item.productId }
                });

                const production = await prisma.production.findFirst({
                    where: { productId: item.productId },
                    include: { materials: { include: { material: true } } }
                });

                if (production) {
                    // If there is BOM, decrease the materilas
                    for (const material of production.materials) {
                        const qtyNeeded = convertUnit(
                            material.qty * item.quantity,
                            material.unit as Unit,
                            material.material.unit as Unit
                        );

                        // Update stok bahan baku
                        const updatedMaterial = await prisma.inventory.update({
                            where: { id: material.materialId },
                            data: { stock: { decrement: qtyNeeded } },
                        });

                        // Validasi stok bahan baku
                        if (updatedMaterial.stock < 0) {
                            throw new Error(`Insufficient ${material.material.product} stock`);
                        }

                        // Cek notifikasi bahan baku
                        const isBelowLimit = updatedMaterial.limit && updatedMaterial.stock <= updatedMaterial.limit;
                        const isOutOfStock = updatedMaterial.stock <= 0;

                        const flooredMaterial = Math.floor(updatedMaterial.stock);

                        if (isBelowLimit || isOutOfStock) {
                            notificationsToCreate.push({
                                title: `The stock of ${updatedMaterial.product} ${isOutOfStock ? 'is out' : 'is low'}`,
                                message: `Stock of ${updatedMaterial.product} is ${flooredMaterial} left ${updatedMaterial.unit}. ${updatedMaterial.limit ? `(Limit: ${updatedMaterial.limit})` : ''}`,
                                type: 'stock',
                                relatedId: updatedMaterial.id
                            });

                            await prisma.inventory.update({
                                where: { id: updatedMaterial.id },
                                data: { lastNotified: new Date() }
                            });
                        }
                    }
                } else {
                    const updatedProduct = await prisma.inventory.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    });

                    // Validasi stok produk
                    if (updatedProduct.stock < 0) {
                        throw new Error(`Insufficient ${product.product} stock`);
                    }

                    // Cek notifikasi produk utama
                    const isBelowLimit = updatedProduct.limit && updatedProduct.stock <= updatedProduct.limit;
                    const isOutOfStock = updatedProduct.stock <= 0;

                    const flooredStock = Math.floor(updatedProduct.stock);

                    if (isBelowLimit || isOutOfStock) {
                        notificationsToCreate.push({
                            title: `The stock of ${updatedProduct.product} ${isOutOfStock ? 'is out' : 'is low'}`,
                            message: `Stock of ${updatedProduct.product} is ${flooredStock} left ${updatedProduct.unit}. ${updatedProduct.limit ? `(Limit: ${updatedProduct.limit})` : ''}`,
                            type: 'stock',
                            relatedId: updatedProduct.id
                        });

                        await prisma.inventory.update({
                            where: { id: updatedProduct.id },
                            data: { lastNotified: new Date() }
                        });
                    }
                }
            }

            const salesInvoice = await prisma.salesInvoice.create({
                data: {
                    amount: total,
                    paymentMethod: paymentMethod,
                    paymentDate: new Date(),
                    salesOrderId: salesOrder.id,
                    bankName: paymentMethod === 'Transfer' ? body.bankName : null,
                    accountNumber: paymentMethod === 'Transfer' ? body.accountNumber : null,
                }
            });

            // Buat notifikasi jika ada
            if (notificationsToCreate.length > 0) {
                await prisma.notification.createMany({
                    data: notificationsToCreate
                });
            }

            return {
                ...salesOrder,
                invoice: salesInvoice,
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('[SALES_POST]', error);
        return new NextResponse(
            error instanceof Error ? error.message : "Internal server error",
            { status: 500 }
        );
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
            { error: 'Sales ID is required' },
            { status: 400 }
        )
    }

    try {
        await prisma.salesInvoice.deleteMany({
            where: { salesOrderId: id }
        })

        await prisma.salesItem.deleteMany({
            where: { salesOrderId: id },
        })

        await prisma.salesOrder.delete({
            where: { id: id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[SALES_DELETE]', error);
        return NextResponse.json(
            { error: 'Failed to delete the sales order' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}