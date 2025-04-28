import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from 'zod';

const updateProductSchema = z
    .object({
        product: z.string().optional(),
        code: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        unit: z.string().optional(),
        buyprice: z.number().int().optional(),
        sellprice: z.number().int().optional(),
        limit: z.coerce.number().int().optional(),
    });

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const body = await req.json();
        const { product, code, category, description, unit, buyprice, sellprice, limit } = updateProductSchema.parse(body);

        const updated = await prisma.inventory.update({
            where: { id },
            data: {
                product,
                code,
                category,
                description,
                unit,
                buyprice,
                sellprice,
                limit
            }
        });

        return NextResponse.json({ product: updated, message: "Product updated successfully" });
    } catch (err) {
        return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
}
