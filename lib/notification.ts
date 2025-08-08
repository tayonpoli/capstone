import { prisma } from './prisma';

export async function checkStockNotifications() {
    const lowStockProducts = await prisma.inventory.findMany({
        where: {
            AND: [
                {
                    AND: [
                        {
                            OR: [
                                { category: 'material' },
                                { category: 'packaging' }
                            ]
                        },
                        { limit: { gt: 0 } },
                        { stock: { lte: prisma.inventory.fields.limit } }
                    ]
                },
                {
                    OR: [
                        { lastNotified: null },
                        { lastNotified: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
                    ]
                }
            ]
        }
    });

    const users = await prisma.user.findMany({
        select: {
            id: true
        }
    });

    for (const product of lowStockProducts) {
        const flooredStock = Math.round(Number(product.stock));
        const notificationData = {
            title: `The stock of ${product.product} ${product.stock <= 0 ? 'is out' : 'is low'}`,
            message: `Stock of ${product.product} only ${flooredStock} ${product.unit} left. ${product.limit ? `(Limit: ${product.limit})` : ''}`,
            type: 'stock',
            relatedId: product.id
        };

        for (const user of users) {
            await prisma.notification.create({
                data: {
                    ...notificationData,
                    userId: user.id
                }
            });
        }

        await prisma.inventory.update({
            where: { id: product.id },
            data: { lastNotified: new Date() }
        });
    }
}

export async function getUserNotifications(userId: string) {
    return await prisma.notification.findMany({
        where: {
            OR: [
                { userId: null },
                { userId }
            ]
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
}

// for (const product of lowStockProducts) {
//     const flooredStock = Math.round(Number(product.stock));
//     await prisma.notification.create({
//         data: {
//             title: `The stock of ${product.product} ${product.stock <= 0 ? 'is out' : 'is low'}`,
//             message: `Stock of ${product.product} only ${flooredStock} ${product.unit} left. ${product.limit ? `(Limit: ${product.limit})` : ''}`,
//             type: 'stock',
//             relatedId: product.id
//         }
//     });

//     // Update lastNotified
//     await prisma.inventory.update({
//         where: { id: product.id },
//         data: { lastNotified: new Date() }
//     });
// }