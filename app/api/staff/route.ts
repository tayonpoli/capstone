import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from 'zod';

const staffSchema = z
    .object({
        name: z.string().min(1, 'Staff name is required').max(100),
        email: z.string(),
        position: z.string(),
        phone: z.string(),
        address: z.string(),
    })


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, position, phone, address, } = staffSchema.parse(body);

        const newStaff = await prisma.staff.create({
            data: {
                name,
                email,
                position,
                phone,
                address
            }
        });

        return NextResponse.json({ staff: newStaff, message: "Staff created successfully" }, { status: 201 });
    } catch (error) {
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
            address: true,
            position: true,
        }
    })
    return NextResponse.json(staff)
}

export async function DELETE(request: Request) {
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
        return NextResponse.json(
            { error: 'Failed to delete staff' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}