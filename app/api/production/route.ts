import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Material } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST(req: Request) {
    try {
        const { name, description, tag, productId, materials } = await req.json();

        // Validasi
        if (!productId || !materials?.length) {
            return new NextResponse("Product and materials are required", { status: 400 });
        }

        const total = materials.reduce((sum: number, mat: Material) => {
            return sum + mat.price;
        }, 0);

        const production = await prisma.$transaction(async (tx) => {
            // 1. Buat Production
            const production = await tx.production.create({
                data: {
                    name,
                    description,
                    tag,
                    productId,
                    total,
                    materials: {
                        create: materials.map((mat: Material) => ({
                            materialId: mat.materialId,
                            qty: mat.qty,
                            unit: mat.unit,
                            price: mat.price
                        }))
                    }
                },
                include: {
                    materials: {
                        include: {
                            material: true
                        }
                    },
                    product: true
                }
            });

            return production;
        });

        return NextResponse.json({
            success: true,
            production
        });

    } catch (error) {
        console.error('[BOM_POST]', error);
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
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const { id } = await request.json()

    if (!id) {
        return NextResponse.json(
            { error: 'Production ID is required' },
            { status: 400 }
        )
    }

    try {
        await prisma.material.deleteMany({
            where: { productionId: id },
        })

        await prisma.production.delete({
            where: { id: id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[PRODUCTION_DELETE_ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to delete the Bills of Material' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}