import { prisma } from './prisma';

export async function checkStockNotifications() {
    // Cek produk yang stoknya di bawah limit atau habis
    const lowStockProducts = await prisma.inventory.findMany({
        where: {
            OR: [
                { stock: { lte: 0 } }, // Out of stock
                {
                    AND: [
                        { limit: { not: null } },
                        { stock: { lte: prisma.inventory.fields.limit } }
                    ]
                } // Di bawah limit
            ],
            OR: [
                { lastNotified: null },
                { lastNotified: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Hanya notif 1x per hari
            ]
        }
    });

    // Buat notifikasi untuk setiap produk
    for (const product of lowStockProducts) {
        await prisma.notification.create({
            data: {
                title: `Stok ${product.product} ${product.stock <= 0 ? 'Habis' : 'Rendah'}`,
                message: `Stok ${product.product} tersisa ${product.stock} ${product.unit}. ${product.limit ? `(Limit: ${product.limit})` : ''}`,
                type: 'stock',
                relatedId: product.id
            }
        });

        // Update lastNotified
        await prisma.inventory.update({
            where: { id: product.id },
            data: { lastNotified: new Date() }
        });
    }
}

// Fungsi untuk mendapatkan notifikasi user
export async function getUserNotifications(userId: string) {
    return await prisma.notification.findMany({
        where: {
            OR: [
                { userId: null }, // Notifikasi global
                { userId }        // Notifikasi spesifik user
            ]
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
}