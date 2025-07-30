import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
    try {
        const body = await request.json();

        const result = await prisma.$transaction(async (prisma) => {
            const updatedCompany = await prisma.company.update({
                where: { id: '1' },
                data: {
                    name: body.name,
                    email: body.email,
                    phone: body.phone,
                    address: body.address,
                },
            });


            return { company: updatedCompany };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('[COMPANY_UPDATE_ERROR]', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {

        const result = await prisma.company.findFirst()

        return NextResponse.json(result);

    } catch (error) {
        console.error('[COMPANY_GET_ERROR]', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}