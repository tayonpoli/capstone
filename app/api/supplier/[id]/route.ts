import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from 'zod';

const updateSupplierSchema = z
    .object({
        name: z.string().min(1, 'Supplier name is required').max(100),
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
        const { name, email, phone, address } = updateSupplierSchema.parse(body);

        const updated = await prisma.supplier.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                address,
            }
        });

        return NextResponse.json({ supplier: updated, message: "Supplier updated successfully" });
    } catch (err) {
        console.error('[SUPPLIER_PUT]', err);
        return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
}
