import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Material } from '@prisma/client';

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

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         const {
//             productId,  // ID produk jadi
//             materials   // Array bahan baku: [{ materialId, qty, unit }]
//         } = body;

//         // Validasi input
//         if (!productId) {
//             return new NextResponse("Product ID is required", { status: 400 });
//         }

//         if (!materials || !materials.length) {
//             return new NextResponse("At least one material is required", { status: 400 });
//         }

//         // Validasi duplikat material
//         const materialIds = materials.map((m: any) => m.materialId);
//         if (new Set(materialIds).size !== materialIds.length) {
//             return new NextResponse("Duplicate materials detected", { status: 400 });
//         }

//         // Mulai transaksi
//         const result = await prisma.$transaction(async (prisma) => {
//             // 1. Hapus BOM lama jika ada (optional)
//             await prisma.production.deleteMany({
//                 where: { productId }
//             });

//             // 2. Buat BOM baru untuk setiap material
//             const createdBoms = await Promise.all(
//                 materials.map((material: any) =>
//                     prisma.production.create({
//                         data: {
//                             productId,
//                             materialId: material.materialId,
//                             qty: material.qty,
//                             unit: material.unit
//                         },
//                         include: {
//                             product: true,
//                             materials: true
//                         }
//                     })
//                 )
//             );

//             return createdBoms;
//         });

//         return NextResponse.json(result);
//     } catch (error) {
//         console.error('[BOM_POST]', error);
//         return new NextResponse("Internal error", { status: 500 });
//     } finally {
//         await prisma.$disconnect();
//     }
// }

export async function DELETE(request: Request) {
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