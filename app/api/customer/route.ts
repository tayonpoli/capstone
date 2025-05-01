import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from 'zod';

const customerSchema = z
    .object({
        name: z.string().min(1, 'Customer name is required').max(100),
        email: z.string(),
        phone: z.string(),
        address: z.string(),
    })


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, address } = customerSchema.parse(body);

        const newCustomer = await prisma.customer.create({
            data: {
                name,
                email,
                phone,
                address,
            }
        });

        return NextResponse.json({ customer: newCustomer, message: "Customer created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const customer = await prisma.customer.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true
            }
        })
        return NextResponse.json(customer)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    const { id } = await request.json()

    if (!id) {
        return NextResponse.json(
            { error: 'Customer ID is required' },
            { status: 400 }
        )
    }

    try {
        await prisma.customer.delete({
            where: { id: id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete customer' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}