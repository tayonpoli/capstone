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

    const total = body.items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Mulai database transaction
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Update data utama sales
      const updatedSale = await prisma.salesOrder.update({
        where: { id: id },
        data: {
          customerId: body.customerId,
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
        data: body.items.map((item: any) => ({
          salesOrderId: id,
          productId: item.productId,
          note: item.note || null,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
      });

      // 4. Update stok produk jika status Completed
      if (body.status === 'Completed') {
        for (const item of body.items) {
          await prisma.inventory.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return { sale: updatedSale, items: createdItems };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[SALES_UPDATE_ERROR]', error);

    // Handle error khusus untuk constraint database
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate entry detected' },
        { status: 409 }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}