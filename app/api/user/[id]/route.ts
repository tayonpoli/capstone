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

        const result = await prisma.$transaction(async (prisma) => {
            const updatedProfile = await prisma.user.update({
                where: { id: id },
                data: {
                    name: body.name,
                    email: body.email,
                },
            });


            return { profile: updatedProfile };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('[PROFILE_UPDATE_ERROR]', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}