import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from 'zod';

const updateCustomerSchema = z
    .object({
        name: z.string().min(1, 'Customer name is required').max(100),
        email: z.string(),
        phone: z.string(),
        address: z.string(),
    })

export async function PUT(req: Request, {
    params,
}: {
    params: Promise<{ id: string }>
}) {
    try {
        const { id } = await params
        const body = await req.json();
        const { name, email, phone, address } = updateCustomerSchema.parse(body);

        const updated = await prisma.customer.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                address,
            }
        });

        return NextResponse.json({ customer: updated, message: "Customer updated successfully" });
    } catch (err) {
        return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
}
