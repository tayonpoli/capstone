import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from 'zod';

const productSchema = z
    .object({
        product: z.string().min(1, 'Product name is required').max(100),
        code: z.string().min(1, 'SKU is required'),
        category: z.string().min(1, 'Category is required'),
        description: z.string(),
        unit: z.string().min(1, 'Unit is required'),
        buyprice: z.number().int(),
        sellprice: z.number().int(),
        limit: z.coerce.number().int(),
    })


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { product, code, category, description, unit, buyprice, sellprice, limit } = productSchema.parse(body);

        const existingCode = await prisma.inventory.findUnique({
            where: { code: code }
        });
        if (existingCode) {
            return NextResponse.json({ product: null, message: "Product with this SKU already exists" }, { status: 409 })
        }

        const newProduct = await prisma.inventory.create({
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

        return NextResponse.json({ product: newProduct, message: "Product created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const inventory = await prisma.inventory.findMany({
            select: {
                id: true,
                product: true,
                code: true,
                unit: true,
                buyprice: true
            }
        })
        return NextResponse.json(inventory)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch inventory' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    const { id } = await request.json()

    if (!id) {
        return NextResponse.json(
            { error: 'Product ID is required' },
            { status: 400 }
        )
    }

    try {
        await prisma.inventory.delete({
            where: { id: id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}