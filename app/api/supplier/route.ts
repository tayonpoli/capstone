import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import * as z from 'zod';

// Define contact schema
const contactSchema = z.object({
    name: z.string().min(1, 'Contact name is required'),
    department: z.string().min(1, 'Department is required'),
    email: z.string().email('Invalid email').or(z.literal('')),
    phone: z.string(),
});

// Update supplier schema to include contacts
const supplierSchema = z.object({
    name: z.string().min(1, 'Supplier name is required').max(100),
    email: z.string().email('Invalid email').or(z.literal('')),
    phone: z.string(),
    address: z.string(),
    contacts: z.array(contactSchema).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, address, contacts } = supplierSchema.parse(body);

        const newSupplier = await prisma.supplier.create({
            data: {
                name,
                email,
                phone,
                address,
                contacts: contacts ? {
                    createMany: {
                        data: contacts.map(contact => ({
                            name: contact.name,
                            department: contact.department,
                            email: contact.email,
                            phone: contact.phone,
                        }))
                    }
                } : undefined,
            },
            include: {
                contacts: true,
            }
        });

        return NextResponse.json(
            { supplier: newSupplier, message: "Supplier created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error('[SUPPLIER_POST]', error);
        return NextResponse.json(
            { message: "Something went wrong!" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                contacts: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                        email: true,
                        phone: true,
                    }
                }
            },
            orderBy: {
                name: 'asc',
            }
        });

        return NextResponse.json(suppliers);
    } catch (error) {
        console.error('[SUPPLIER_GET]', error);
        return NextResponse.json(
            { error: 'Failed to fetch suppliers' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['Admin', 'Owner'];

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    if (!allowedRoles.includes(session.user.role)) {
        return NextResponse.json(
            { error: 'You are unauthorized' },
            { status: 401 }
        );
    }

    const { id } = await request.json();

    if (!id) {
        return NextResponse.json(
            { error: 'Supplier ID is required' },
            { status: 400 }
        );
    }

    try {
        // First delete all contacts associated with the supplier
        await prisma.contact.deleteMany({
            where: { supplierId: id },
        });

        // Then delete the supplier
        await prisma.supplier.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[SUPPLIER_DELETE]', error);
        return NextResponse.json(
            { error: 'Failed to delete supplier' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}