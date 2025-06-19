import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { convertUnit } from '@/lib/units';
import { SalesItem, Unit } from '@prisma/client';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { customerId, items, ...salesData } = body;

        // Validasi input
        if (!customerId) return new NextResponse("Customer ID required", { status: 400 });
        if (!items?.length) return new NextResponse("Items required", { status: 400 });

        // Hitung total sales
        const total = items.reduce((sum: number, item: SalesItem) => sum + (item.price * item.quantity), 0);

        const result = await prisma.$transaction(async (prisma) => {
            // 1. Buat sales order
            const salesOrder = await prisma.salesOrder.create({
                data: {
                    ...salesData,
                    customerId,
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
                include: { items: true },
            });

            const notificationsToCreate = [];

            // 2. Proses setiap item dalam sales order
            for (const item of items) {
                // 2a. Dapatkan produk
                const product = await prisma.inventory.findUniqueOrThrow({
                    where: { id: item.productId }
                });

                const production = await prisma.production.findFirst({
                    where: { productId: item.productId },
                    include: { materials: { include: { material: true } } }
                });

                if (production) {
                    // Jika ada BOM, kurangi stok bahan baku saja
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
                    // Jika tidak ada BOM, kurangi stok produk utama
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

            // Buat notifikasi jika ada
            if (notificationsToCreate.length > 0) {
                await prisma.notification.createMany({
                    data: notificationsToCreate
                });
            }

            return salesOrder;
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

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         const {
//             customerId,
//             address,
//             email,
//             orderDate,
//             tag,
//             status,
//             memo,
//             items
//         } = body;

//         if (!customerId) {
//             return new NextResponse("Customer ID is required", { status: 400 });
//         }

//         if (!items || !items.length) {
//             return new NextResponse("Items are required", { status: 400 });
//         }

//         // Calculate total
//         const total = items.reduce((sum: number, item: any) => {
//             return sum + (item.price * item.quantity);
//         }, 0);

//         // Start transaction
//         const result = await prisma.$transaction(async (prisma) => {
//             // 1. Create sales order
//             const salesOrder = await prisma.salesOrder.create({
//                 data: {
//                     customerId,
//                     address,
//                     email,
//                     orderDate: new Date(orderDate),
//                     tag,
//                     status,
//                     memo,
//                     total,
//                     items: {
//                         create: items.map((item: any) => ({
//                             productId: item.productId,
//                             note: item.note,
//                             quantity: item.quantity,
//                             price: item.price,
//                             total: item.price * item.quantity,
//                         })),
//                     },
//                 },
//                 include: {
//                     items: true,
//                 },
//             });

//             // 2. Update stock for each product
//             for (const item of items) {
//                 await prisma.inventory.update({
//                     where: { id: item.productId },
//                     data: {
//                         stock: {
//                             decrement: item.quantity
//                         }
//                     }
//                 });

//                 // Optional: Check for negative stock (if you want to prevent it)
//                 const updatedProduct = await prisma.inventory.findUnique({
//                     where: { id: item.productId }
//                 });

//                 if (updatedProduct && updatedProduct.stock < 0) {
//                     throw new Error(`Insufficient stock for product ${item.productId}`);
//                 }
//             }

//             return salesOrder;
//         });

//         return NextResponse.json(result);
//     } catch (error) {
//         console.error('[SALES_POST]', error);

//         if (error instanceof Error && error.message.includes('Insufficient stock')) {
//             return new NextResponse(error.message, { status: 400 });
//         }

//         return new NextResponse("Internal error", { status: 500 });
//     } finally {
//         await prisma.$disconnect();
//     }
// }

export async function DELETE(request: Request) {
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