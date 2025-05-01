import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from 'zod';

const supplierSchema = z
    .object({
        name: z.string().min(1, 'Supplier name is required').max(100),
        email: z.string(),
        phone: z.string(),
        address: z.string(),
    })


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, address } = supplierSchema.parse(body);

        const newSupplier = await prisma.supplier.create({
            data: {
                name,
                email,
                phone,
                address,
            }
        });

        return NextResponse.json({ supplier: newSupplier, message: "Supplier created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const supplier = await prisma.supplier.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true
            }
        })
        return NextResponse.json(supplier)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch supplier' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    const { id } = await request.json()

    if (!id) {
        return NextResponse.json(
            { error: 'Supplier ID is required' },
            { status: 400 }
        )
    }

    try {
        await prisma.supplier.delete({
            where: { id: id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete supplier' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}