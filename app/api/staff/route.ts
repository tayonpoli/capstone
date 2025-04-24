import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from 'zod';

export async function GET() {
    const staff = await prisma.staff.findMany({
        select: {
            id: true,
            name: true,
            email: true
        }
    })
    return NextResponse.json(staff)
}