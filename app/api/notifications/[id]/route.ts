import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const notificationId = params.id;

        if (!notificationId) {
            return new NextResponse("Notification ID required", { status: 400 });
        }

        // Update status notifikasi
        const updatedNotification = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });

        return NextResponse.json(updatedNotification);
    } catch (error) {
        console.error('[NOTIFICATION_PATCH]', error);
        return new NextResponse(
            error instanceof Error ? error.message : "Internal server error",
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.notification.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse("Internal error", { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}