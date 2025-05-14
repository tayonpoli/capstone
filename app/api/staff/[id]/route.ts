import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from 'zod';

const updateStaffSchema = z
    .object({
        name: z.string().min(1, 'Staff name is required').max(100),
        email: z.string(),
        position: z.string(),
        // phone: z.string(),
        // address: z.string(),
    })

export async function PUT(req: Request, {
    params,
}: {
    params: Promise<{ id: string }>
}) {
    try {
        const { id } = await params
        const body = await req.json();
        const { name, email, position } = updateStaffSchema.parse(body);

        const updated = await prisma.staff.update({
            where: { id },
            data: {
                name,
                email,
                position,
            }
        });

        return NextResponse.json({ staff: updated, message: "Staff updated successfully" });
    } catch (err) {
        return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
}
