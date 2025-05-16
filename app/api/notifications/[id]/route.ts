import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params,
    }: {
        params: Promise<{ id: string }>
    }) {
    try {
        const { id } = await params

        if (!id) {
            return new NextResponse("Notification ID required", { status: 400 });
        }

        // Update status notifikasi
        const updatedNotification = await prisma.notification.update({
            where: { id: id },
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
    request: Request, {
        params,
    }: {
        params: Promise<{ id: string }>
    }) {
    try {
        const { id } = await params
        await prisma.notification.delete({
            where: { id: id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[NOTIFICATION_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}