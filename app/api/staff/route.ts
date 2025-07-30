import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Type } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import * as z from 'zod';

const staffSchema = z
    .object({
        name: z.string().min(1, 'Staff name is required').max(100),
        email: z.string(),
        position: z.string(),
        type: z.nativeEnum(Type),
        phone: z.string(),
        address: z.string(),
    })


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, position, type, phone, address, } = staffSchema.parse(body);

        const newStaff = await prisma.staff.create({
            data: {
                name,
                email,
                position,
                type,
                phone,
                address
            }
        });

        return NextResponse.json({ staff: newStaff, message: "Staff created successfully" }, { status: 201 });
    } catch (error) {
        console.error('[STAFF_POST]', error);
        return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
    }
}

export async function GET() {
    const staff = await prisma.staff.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            type: true,
            address: true,
            position: true,
        }
    })
    return NextResponse.json(staff)
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
            { error: 'You are unauthorized' },
            { status: 401 }
        );
    }
    const { id } = await request.json()

    if (!id) {
        return NextResponse.json(
            { error: 'Staff ID is required' },
            { status: 400 }
        )
    }

    try {
        await prisma.staff.delete({
            where: { id: id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[STAFF_DELETE]', error);
        return NextResponse.json(
            { error: 'Failed to delete staff' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}