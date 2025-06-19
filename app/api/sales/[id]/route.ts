import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SalesItem, Unit } from '@prisma/client';
import { convertUnit } from '@/lib/units';

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
    if (!body.customerId || !body.orderDate || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validasi status
    const validStatuses = ['Draft', 'Approved', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const total = body.items.reduce((sum: number, item: SalesItem) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Mulai database transaction
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Update data utama sales
      const updatedSale = await prisma.salesOrder.update({
        where: { id: id },
        data: {
          customerId: body.customerId,
          customerName: body.customerName,
          address: body.address,
          email: body.email,
          orderDate: new Date(body.orderDate),
          tag: body.tag,
          status: body.status,
          memo: body.memo,
          total,
        },
      });

      // 2. Hapus semua items yang lama
      await prisma.salesItem.deleteMany({
        where: { salesOrderId: id },
      });

      // 3. Buat items yang baru
      const createdItems = await prisma.salesItem.createMany({
        data: body.items.map((item: SalesItem) => ({
          salesOrderId: id,
          productId: item.productId,
          note: item.note || null,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
      });

      const notificationsToCreate = [];

      // 4. Update stok produk jika status Completed
      if (body.status === 'Completed') {
        for (const item of body.items) {
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
      }

      return { sale: updatedSale, items: createdItems };
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('[SALES_UPDATE_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}