import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from 'zod';

export async function GET() {
    const suppliers = await prisma.supplier.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            address: true
        }
    })
    return NextResponse.json(suppliers)
}