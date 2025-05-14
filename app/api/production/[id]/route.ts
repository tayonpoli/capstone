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
        if (!body.productId || !body.materials || body.materials.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const total = body.materials.reduce((sum: number, item: any) => {
            return sum + item.price;
        }, 0);

        // Mulai database transaction
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Update data utama sales
            const updatedBom = await prisma.production.update({
                where: { id: id },
                data: {
                    name: body.name,
                    description: body.description,
                    productId: body.productId,
                    total,
                },
            });

            // 2. Hapus semua items yang lama
            await prisma.material.deleteMany({
                where: { productionId: id },
            });

            // 3. Buat items yang baru
            const createdItems = await prisma.material.createMany({
                data: body.materials.map((item: any) => ({
                    productionId: id,
                    materialId: item.materialId,
                    qty: item.qty,
                    unit: item.unit,
                    price: item.price,
                })),
            });

            //   // 4. Update stok produk jika status Completed
            //   if (body.status === 'Completed') {
            //     for (const item of body.items) {
            //       await prisma.inventory.update({
            //         where: { id: item.productId },
            //         data: {
            //           stock: {
            //             decrement: item.quantity,
            //           },
            //         },
            //       });
            //     }
            //   }

            return { production: updatedBom, materials: createdItems };
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[PRODUCTION_UPDATE_ERROR]', error);

        // Handle error khusus untuk constraint database
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Duplicate entry detected' },
                { status: 409 }
            );
        }

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'BOM not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}