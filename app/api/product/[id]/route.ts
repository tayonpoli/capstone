import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import * as z from 'zod';

const UnitEnum = z.enum(["Pcs", "Box", "Kg", "gram", "Litre", "ml"]);

const updateProductSchema = z
    .object({
        product: z.string().optional(),
        code: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        unit: UnitEnum,
        buyprice: z.number().int().optional(),
        sellprice: z.number().int().optional(),
        limit: z.coerce.number().int().optional(),
    });

export async function PUT(req: Request, {
    params,
}: {
    params: Promise<{ id: string }>
}) {
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
    try {
        const { id } = await params
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
        console.error('[PRODUCT_PUT]', err);
        return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
}

export async function PATCH(request: Request, {
    params
}: {
    params: Promise<{ id: string }>
}) {
    try {

        const { id } = await params
        const { stock } = await request.json(); // Langsung menggunakan field 'stock'

        // Validasi
        if (typeof stock !== "number" || stock < 0) {
            return new NextResponse("Stock must be a positive number", { status: 400 });
        }

        // Partial update hanya field stock
        const updatedProduct = await prisma.inventory.update({
            where: { id: id },
            data: { stock },
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error("[PRODUCT_UPDATE_STOCK]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
