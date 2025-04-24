// app/api/purchase/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from 'zod';

const purchaseSchema = z.object({
    supplierId: z.string().min(1, 'Supplier is required'),
    staffId: z.string().min(1, 'Staff is required'),
    purchaseDate: z.string().datetime(),
    dueDate: z.string().datetime(),
    urgency: z.enum(['Low', 'Medium', 'High']),
    memo: z.string().optional(),
    products: z.array(
        z.object({
            productId: z.string().min(1, 'Product is required'),
            quantity: z.number().min(1, 'Quantity must be at least 1'),
            unit: z.string().min(1, 'Unit is required'),
            unitPrice: z.number().min(0, 'Price must be positive'),
            description: z.string().optional(),
        })
    ).min(1, 'At least one product is required'),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { staffId, supplierId, purchaseDate, dueDate, urgency, memo, products } = purchaseSchema.parse(body);

        // Calculate totals
        const subtotal = products.reduce((sum, product) => sum + (product.unitPrice * product.quantity), 0);
        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        // Generate order number (format: PO-YYYYMMDD-XXXX)
        const today = new Date();
        const orderNumber = `PO-${today.getFullYear()}${(today.getMonth() + 1)
            .toString()
            .padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-${Math.floor(
                Math.random() * 10000
            ).toString().padStart(4, '0')}`;

        // Create purchase order
        const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
                staffId,
                supplierId,
                purchaseDate: new Date(purchaseDate),
                dueDate: new Date(dueDate),
                urgency,
                subtotal,
                tax,
                total,
                status: 'Draft',
                memo,
                items: {
                    create: products.map(product => ({
                        productId: product.productId,
                        quantity: product.quantity,
                        unit: product.unit,
                        unitPrice: product.unitPrice,
                        totalPrice: product.unitPrice * product.quantity,
                        description: product.description,
                    })),
                },
            },
            include: {
                staff: true,
                supplier: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // Update inventory stock
        for (const item of products) {
            await prisma.inventory.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        increment: item.quantity,
                    },
                },
            });
        }

        return NextResponse.json({
            data: purchaseOrder,
            message: 'Purchase order created successfully',
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating purchase order:', error);
        return NextResponse.json(
            { error: 'Failed to create purchase order' },
            { status: 500 }
        );
    }
}

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const purchaseOrders = await prisma.purchaseOrder.findMany({
//       include: {
//         staff: true,
//         supplier: true,
//         items: {
//           include: {
//             product: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     return NextResponse.json({ data: purchaseOrders });
//   } catch (error) {
//     console.error('Error fetching purchase orders:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch purchase orders' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: Request) {
//     const { id } = await request.json()

//     if (!id) {
//         return NextResponse.json(
//             { error: 'Product ID is required' },
//             { status: 400 }
//         )
//     }

//     try {
//         await prisma.inventory.delete({
//             where: { id: Number(id) }
//         })
//         return NextResponse.json({ success: true })
//     } catch (error) {
//         return NextResponse.json(
//             { error: 'Failed to delete product' },
//             { status: 500 }
//         )
//     } finally {
//         await prisma.$disconnect()
//     }
// }